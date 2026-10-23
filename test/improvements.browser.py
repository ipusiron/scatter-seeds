"""Regression checks for share invalidation, camera races, QR viewing and text fidelity.

Run: python test/improvements.browser.py
Uses synthetic secrets and canvas streams only. No real camera or clipboard is used.
"""
import argparse
import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = (ROOT / "index.html").as_uri()
BIP39 = " ".join(["abandon"] * 11 + ["about"])
TEXT = "\ufeffBOM\n\"quoted\"\\slash\t<>&\u202eEND"


def report(*values):
    print(*values, flush=True)


def open_page(browser, width=1280, language="ja", theme="light"):
    page = browser.new_page(viewport={"width": width, "height": 1000}, locale=language)
    page.set_default_timeout(10000)
    page.goto(URL + "?lang=" + language)
    if page.locator("html").get_attribute("data-theme") != theme:
        page.click("#theme")
    page.evaluate("""() => {
        window.__copied = [];
        Object.defineProperty(navigator, 'clipboard', {configurable: true,
          value: {writeText: async value => { window.__copied.push(value); }}});
    }""")
    return page


def no_overflow(page, label):
    assert page.evaluate("() => document.documentElement.scrollWidth <= document.documentElement.clientWidth"), label


def generate(page, secret="SYNTHETIC", k=2, n=3):
    page.select_option("#secret-kind", "text")
    page.fill("#secret-input", secret)
    page.fill("#split-k", str(k))
    page.fill("#split-n", str(n))
    page.fill("#share-label", "TEST LABEL")
    page.fill("#print-date", "2026-10-23")
    page.click("#split-button")
    page.wait_for_function("""n => document.querySelectorAll('#share-cards .certificate').length === n
      && !document.querySelector('#print-controls').hidden
      && document.querySelector('#split-progress').hidden""", arg=n)


def shares(page):
    return page.locator("#share-cards .share-string").all_text_contents()


def size_contains(page, count):
    value = page.locator("#input-size").inner_text()
    assert re.search(r"(?<!\d)" + str(count) + r"(?!\d)", value), (count, value)
    assert "256" in value, value


def check_sizes(page):
    page.fill("#secret-input", "\u00e9\U0001f431")
    size_contains(page, 6)
    page.fill("#secret-input", "A" * 257)
    size_contains(page, 257)
    page.select_option("#secret-kind", "bytes")
    page.fill("#secret-input", "00ff7e")
    size_contains(page, 3)
    previous = page.locator("#input-size").inner_text()
    page.fill("#secret-input", "0")
    invalid = page.locator("#input-size").inner_text()
    assert invalid and invalid != previous, invalid
    page.select_option("#secret-kind", "bip39")
    page.fill("#secret-input", BIP39)
    size_contains(page, 16)
    previous = page.locator("#input-size").inner_text()
    page.fill("#secret-input", "not-a-bip39-phrase")
    invalid = page.locator("#input-size").inner_text()
    assert invalid and invalid != previous, invalid


def check_invalidation(page):
    changes = [
        ("secret-input", "NEW SYNTHETIC"), ("split-k", "3"), ("split-n", "4"),
        ("secret-kind", "bytes"), ("share-label", "CHANGED LABEL"), ("print-date", "2026-10-24"),
    ]
    for element_id, value in changes:
        generate(page)
        before = page.locator("#split-status").inner_text()
        if element_id == "secret-kind":
            page.select_option("#" + element_id, value)
        else:
            page.fill("#" + element_id, value)
        assert page.locator("#share-cards").inner_text() == "", element_id
        assert page.locator("#print-controls").is_hidden(), element_id
        assert page.locator("#instruction-page").is_hidden(), element_id
        assert page.locator("#split-status").inner_text() != before, element_id
        assert page.locator("#split-status").inner_text().strip(), element_id
        assert page.locator("#share-cards img").count() == 0, element_id


def check_inflight_invalidation(page):
    page.select_option("#secret-kind", "text")
    page.fill("#secret-input", "A" * 64)
    page.fill("#split-k", "8")
    page.fill("#split-n", "16")
    page.evaluate("""() => {
      document.querySelector('#split-button').click();
      const input = document.querySelector('#secret-input');
      input.value = 'CHANGED DURING VERIFICATION';
      input.dispatchEvent(new Event('input', {bubbles: true}));
    }""")
    page.wait_for_function("() => !document.querySelector('#split-button').disabled")
    page.evaluate("() => new Promise(resolve => setTimeout(resolve, 50))")
    assert page.locator("#share-cards .certificate").count() == 0
    assert page.locator("#print-controls").is_hidden()
    assert page.locator("#split-progress").is_hidden()



def check_copy_races(page):
    for outcome in ("resolve", "reject"):
        for after_edit in ("edited", "regenerated"):
            generate(page, "SYNTHETIC OLD COPY")
            page.evaluate("""() => {
              window.__copyRequests = [];
              Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {
                writeText: value => new Promise((resolve, reject) =>
                  window.__copyRequests.push({resolve, reject}))
              }});
            }""")
            page.locator("#share-cards .card-actions button").first.click()
            assert page.evaluate("() => __copyRequests.length") == 1
            page.fill("#secret-input", "SYNTHETIC CHANGED COPY")
            assert page.locator("#share-cards .certificate").count() == 0
            if after_edit == "regenerated":
                generate(page, "SYNTHETIC NEW COPY")
            expected_status = page.locator("#split-status").inner_text()
            page.evaluate("""async outcome => {
              const pending = __copyRequests[0];
              if (outcome === 'resolve') pending.resolve();
              else pending.reject(new Error('synthetic old clipboard failure'));
              await new Promise(resolve => setTimeout(resolve, 0));
            }""", outcome)
            assert page.locator("#split-status").inner_text() == expected_status, (outcome, after_edit)
            expected_count = 3 if after_edit == "regenerated" else 0
            assert page.locator("#share-cards .certificate").count() == expected_count

    generate(page, "SYNTHETIC SNAPSHOT CHECK")
    page.evaluate("""() => {
      window.__copyCalls = 0;
      Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {
        writeText: async value => { window.__copyCalls++; }
      }});
      document.querySelector('#secret-input').value = 'CHANGED WITHOUT INPUT EVENT';
    }""")
    page.locator("#share-cards .card-actions button").first.click()
    assert page.evaluate("() => __copyCalls") == 0
    assert page.locator("#share-cards .certificate").count() == 0
    report("delayed share copy success/failure and copy snapshot validation OK")


def check_qr(page, width):
    generate(page, "Q" * 256, 2, 2)
    qr_values = page.evaluate("""() => {
      const image = document.querySelector('#share-cards .qr-image');
      const raw = document.querySelector('#share-cards .share-string').textContent.replace(/\s/g, '');
      const count = ScatterQR.make(raw).getModuleCount();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let left = canvas.width, top = canvas.height, right = 0, bottom = 0;
      for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
        if (pixels[(y * canvas.width + x) * 4] < 128) {
          left = Math.min(left, x); top = Math.min(top, y);
          right = Math.max(right, x); bottom = Math.max(bottom, y);
        }
      }
      return {cell: (right-left+1)/count,
        margins: [left, top, canvas.width-right-1, canvas.height-bottom-1],
        width: image.getBoundingClientRect().width, raw};
    }""")
    assert min(qr_values["margins"]) >= 4 * qr_values["cell"], qr_values
    opener = page.locator("#share-cards .qr-enlarge").first
    opener.click()
    dialog = page.locator("#qr-dialog")
    assert dialog.is_visible()
    page.wait_for_function("() => document.querySelector('#qr-large-image').naturalWidth > 0")
    decoded = page.locator("#qr-large-image").evaluate("""image => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = ScatterQR.scan(pixels.data, canvas.width, canvas.height);
      return result && result.data;
    }""")
    assert decoded == qr_values["raw"], decoded
    assert dialog.evaluate("(e) => e.contains(document.activeElement)")
    for _ in range(4):
        page.keyboard.press("Tab")
        assert dialog.evaluate("(e) => e.contains(document.activeElement)")
    page.keyboard.press("Shift+Tab")
    assert dialog.evaluate("(e) => e.contains(document.activeElement)")
    assert dialog.evaluate("(e) => e.scrollWidth <= e.clientWidth")
    box = dialog.bounding_box()
    assert box["x"] >= 0 and box["x"] + box["width"] <= width + 1, box
    if width == 1280:
        assert page.locator("#qr-large-image").bounding_box()["width"] > qr_values["width"]
    no_overflow(page, "QR dialog")
    page.keyboard.press("Escape")
    assert dialog.is_hidden()
    assert opener.evaluate("(e) => e === document.activeElement")
    opener.click()
    page.click("#qr-close")
    assert dialog.is_hidden()
    assert opener.evaluate("(e) => e === document.activeElement")


def check_text_roundtrip(page):
    generate(page, TEXT, 2, 3)
    original_shares = shares(page)
    page.click("#tab-restore")
    page.fill("#restore-input", "\n".join(original_shares[:2]))
    page.click("#restore-button")
    assert page.locator("#restored-value").is_hidden()
    page.click("#reveal")
    displayed = page.locator("#restored-value").inner_text()
    assert json.loads(displayed) == TEXT, repr(displayed)
    assert page.locator("#restored-value").locator("*").count() == 0
    page.click("#copy-restored")
    page.wait_for_function("() => window.__copied.length === 1")
    assert page.evaluate("() => window.__copied[0]") == TEXT
    page.fill("#restore-input", original_shares[0])
    assert page.locator("#restored").is_hidden()
    assert page.locator("#restored-value").inner_text() == ""
    no_overflow(page, "Restored text")


CAMERA_STUB = """() => {
  window.__requests = []; window.__streams = []; window.__canvases = [];
  window.__playRequests = []; window.__delayPlay = false;
  navigator.mediaDevices.getUserMedia = () =>
    new Promise((resolve, reject) => window.__requests.push({resolve, reject}));
  HTMLMediaElement.prototype.play = function() {
    if (window.__delayPlay) return new Promise(resolve => window.__playRequests.push(resolve));
    return Promise.resolve();
  };
  window.__release = i => {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    canvas.getContext('2d').fillRect(0, 0, 64, 64);
    const stream = canvas.captureStream(1);
    window.__canvases.push(canvas); window.__streams.push(stream);
    window.__requests[i].resolve(stream);
  };
}"""


def camera_page(browser):
    page = open_page(browser)
    page.evaluate(CAMERA_STUB)
    page.click("#tab-restore")
    return page


def tracks(page):
    return page.evaluate("() => __streams.map(s => s.getVideoTracks()[0].readyState)")


def finish_camera_page(page):
    page.evaluate("() => __streams.forEach(s => s.getTracks().forEach(t => t.stop()))")
    page.close()


def check_camera_races(browser, name):
    for cancel in ("stop", "clear", "tab", "pagehide"):
        page = camera_page(browser)
        page.click("#camera-button")
        assert page.locator("#stop-camera").is_visible(), cancel
        page.evaluate("() => document.querySelector('#camera-button').click()")
        assert page.evaluate("() => __requests.length") == 1, cancel
        if cancel == "stop":
            page.click("#stop-camera")
        elif cancel == "clear":
            page.click("#clear-restore")
        elif cancel == "tab":
            page.click("#tab-split")
        else:
            page.evaluate("() => window.dispatchEvent(new Event('pagehide'))")
        page.evaluate("() => __release(0)")
        page.wait_for_function("() => __streams[0].getVideoTracks()[0].readyState === 'ended'")
        assert page.locator("#camera-view").is_hidden(), cancel
        assert page.locator("#camera-video").evaluate("(e) => e.srcObject === null"), cancel
        finish_camera_page(page)

    for old_outcome in ("resolve", "reject"):
        page = camera_page(browser)
        page.click("#camera-button")
        page.click("#stop-camera")
        page.click("#camera-button")
        assert page.evaluate("() => __requests.length") == 2
        page.evaluate("() => __release(1)")
        page.wait_for_function("() => document.querySelector('#camera-video').srcObject === __streams[0]")
        if old_outcome == "resolve":
            page.evaluate("() => __release(0)")
            page.wait_for_function("() => __streams[1].getVideoTracks()[0].readyState === 'ended'")
        else:
            page.evaluate("() => __requests[0].reject(new Error('synthetic old request'))")
            page.evaluate("() => new Promise(resolve => setTimeout(resolve, 20))")
        assert tracks(page)[0] == "live", (old_outcome, tracks(page))
        assert page.locator("#camera-view").is_visible(), old_outcome
        page.click("#stop-camera")
        assert all(state == "ended" for state in tracks(page))
        finish_camera_page(page)

    page = camera_page(browser)
    page.evaluate("() => { window.__delayPlay = true; }")
    page.click("#camera-button")
    page.evaluate("() => __release(0)")
    page.wait_for_function("() => __playRequests.length === 1")
    page.click("#stop-camera")
    page.evaluate("() => { window.__delayPlay = false; }")
    page.click("#camera-button")
    page.evaluate("() => __release(1)")
    page.wait_for_function("() => document.querySelector('#camera-video').srcObject === __streams[1]")
    page.evaluate("() => __playRequests[0]()")
    page.evaluate("() => new Promise(resolve => setTimeout(resolve, 20))")
    assert tracks(page) == ["ended", "live"], tracks(page)
    assert page.locator("#camera-view").is_visible()
    page.click("#stop-camera")
    assert tracks(page) == ["ended", "ended"]
    finish_camera_page(page)
    report(name, "camera pending cancellation, duplicate click, old completion/rejection and delayed play OK")


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--browser", action="append", choices=("chromium", "firefox"),
                    help="Run one browser; repeat for both. Default: both.")
args = parser.parse_args()

with sync_playwright() as playwright:
    for name in args.browser or ("chromium", "firefox"):
        browser = getattr(playwright, name).launch(headless=True)
        for width in (320, 1280):
            for language in ("ja", "en"):
                for theme in ("light", "dark"):
                    page = open_page(browser, width, language, theme)
                    check_sizes(page)
                    check_invalidation(page)
                    check_qr(page, width)
                    check_text_roundtrip(page)
                    report(name, width, language, theme, "sizes, invalidation, QR dialog and exact text copy OK")
                    page.close()
        page = open_page(browser)
        check_inflight_invalidation(page)
        check_copy_races(page)
        page.close()
        check_camera_races(browser, name)
        browser.close()