"""file:// browser checks. Run with Python Playwright: python test/interface.browser.py."""
import base64
import io
import json
import shutil
import subprocess
import zlib
from pathlib import Path

from playwright.sync_api import sync_playwright
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
URL = (ROOT / 'index.html').as_uri() + '?lang=ja'
VECTORS = json.loads((ROOT / 'test/fixtures/vectors.json').read_text(encoding='utf-8'))


def forged(share, data_byte):
    body = bytearray.fromhex(share[5:])[:-4]
    body[8 + data_byte] ^= 1
    return 'SSS1-' + (body + zlib.crc32(body).to_bytes(4, 'big')).hex().upper()


def measure(page, label):
    value = page.evaluate('() => document.documentElement.scrollWidth - document.documentElement.clientWidth')
    assert value == 0, (label, value)


def help_check(page, name, width):
    for language in ('ja', 'en'):
        if page.locator('html').get_attribute('lang') != language:
            page.click('#language')
        for theme in ('light', 'dark'):
            if page.locator('html').get_attribute('data-theme') != theme:
                page.click('#theme')
            page.click('#help')
            assert page.locator('#help-title').evaluate('(e) => e === document.activeElement')
            dialog = page.locator('#help-dialog')
            assert dialog.evaluate('(e) => e.scrollWidth === e.clientWidth')
            assert page.locator('#help-content').evaluate('(e) => e.scrollWidth === e.clientWidth')
            for selector in ('[data-i18n]', '[data-label]'):
                assert dialog.locator(selector).evaluate_all('(els) => els.every(e => e.textContent.trim())')
            copy = dialog.inner_text()
            assert '???' not in copy and 'undefined' not in copy
            assert 'Day123' in copy and '2-of-3' in copy
            assert '2 ≤ k ≤ n ≤ 16' in copy
            assert dialog.locator('li[data-i18n^="guideAvoid"]').count() == 7
            assert dialog.locator('li[data-i18n^="guideCase"]').count() == 4
            link = dialog.locator('.help-link')
            assert link.get_attribute('href') == 'https://ipusiron.github.io/shamir-sharing-cipherlab/'
            assert link.get_attribute('target') == '_blank'
            # Tab must stay in the modal while the underlying tabs are inert.
            for _ in range(5):
                page.keyboard.press('Tab')
                assert dialog.evaluate('(e) => e.contains(document.activeElement)')
            page.locator('#help-close').focus()
            page.keyboard.press('Shift+Tab')
            assert link.evaluate('(e) => e === document.activeElement')
            page.keyboard.press('Tab')
            assert page.locator('#help-close').evaluate('(e) => e === document.activeElement')
            page.locator('[data-i18n="helpChecks"]').scroll_into_view_if_needed()
            assert page.locator('#help-content').evaluate('(e) => e.scrollTop > 0')
            close = page.locator('#help-close').bounding_box()
            assert 0 <= close['y'] and close['y'] + close['height'] <= page.viewport_size['height']
            assert close['height'] >= 44
            measure(page, (name, width, language, theme, 'long help'))
            page.keyboard.press('Escape')
            assert not dialog.is_visible()
            assert page.locator('#help').evaluate('(e) => e === document.activeElement')
            page.click('#help')
            assert page.locator('#help-content').evaluate('(e) => e.scrollTop') == 0
            page.click('#help-close')
            assert page.locator('#help').evaluate('(e) => e === document.activeElement')



def changed_header(share, offset, value):
    body = bytearray.fromhex(share[5:])[:-4]
    body[offset] = value
    return 'SSS1-' + (body + zlib.crc32(body).to_bytes(4, 'big')).hex().upper()


def restore_guidance_check(page, name, width):
    shares = VECTORS['vectors'][0]['shares']
    page.click('#tab-restore')
    for language, theme in (('ja', 'light'), ('en', 'dark')):
        if page.locator('html').get_attribute('lang') != language:
            page.click('#language')
        if page.locator('html').get_attribute('data-theme') != theme:
            page.click('#theme')
        def status(key, args=None):
            return page.evaluate('([lang,key,args]) => { const v=ScatterMessages[lang][key]; '
                                 'return typeof v === "function" ? v(...args) : v; }',
                                 [language, key, args or []])
        def check(values, key, args=None, issue=None):
            page.fill('#restore-input', '\n'.join(values))
            page.click('#restore-button')
            assert page.locator('#restore-status').inner_text() == status(key, args)
            if issue:
                assert status(issue) in page.locator('#restore-issues').inner_text()
            measure(page, (name, width, language, key))
        if width == 320:
            check([], 'noShares')
            check(['SSS1-XX'], 'invalidShares', issue='rowFormat')
            bad_crc = shares[0][:-1] + ('0' if shares[0][-1] != '0' else '1')
            check([bad_crc], 'invalidShares', issue='rowCrc')
            check([shares[0], shares[0]], 'invalidShares', issue='rowDuplicate')
            check([shares[0], changed_header(shares[1], 1, 0)], 'invalidShares', issue='rowSet')
            check([shares[0], changed_header(shares[1], 5, 3)], 'invalidShares', issue='rowThreshold')
            check([changed_header(shares[0], 7, 0)], 'invalidShares', issue='rowX')
            check([changed_header(shares[0], 0, 2)], 'invalidShares', issue='rowVersion')
        check([shares[0]], 'need', [1])
        assert page.locator('#restored').is_hidden()
        assert '5EED1234' in page.locator('#restore-summary').inner_text()
        check([shares[0], forged(shares[1], 3)], 'fingerprintBad')
        assert page.locator('#restored').is_hidden()
        check([shares[0], shares[1], forged(shares[2], 0)], 'inconsistent', [[3]], 'rowExtra')
        assert page.locator('#restored').is_visible()
        assert page.locator('#restored-value').is_hidden()
        assert page.locator('#check-rows tr').nth(2).locator('td').nth(5).inner_text().endswith('3')
        details = page.locator('.restore-check-help')
        page.locator('#clear-restore').focus()
        page.keyboard.press('Tab')
        assert details.locator('summary').evaluate('(e) => e === document.activeElement')
        if details.get_attribute('open') is None:
            page.keyboard.press('Enter')
        assert details.get_attribute('open') is not None
        assert details.locator('summary').evaluate('(e) => getComputedStyle(e).outlineStyle') != 'none'
        measure(page, (name, width, language, 'expanded check guidance'))
        assert page.locator('#check-table').evaluate('(e) => e.scrollWidth <= e.parentElement.clientWidth')
        check(shares[:2], 'restoredReady')
        assert page.locator('#restore-issues').is_hidden()
        assert page.locator('#check-rows tr').first.locator('td').nth(3).inner_text().endswith('5EED1234')
        page.click('#reveal')
        assert page.locator('#restored-value').inner_text() == 'Scatter Seeds'
        page.click('#reveal')
        assert page.locator('#restored-value').inner_text() == ''
        page.click('#reveal')
        page.fill('#restore-input', shares[0])
        assert page.locator('#restore-status').inner_text() == status('restoreEdited')
        assert page.locator('#restored').is_hidden()
        assert page.locator('#restored-value').inner_text() == ''
        assert page.locator('#restore-checks').is_hidden()
        assert page.locator('#restore-summary').is_hidden()
        page.click('#clear-restore')
        assert page.locator('#restore-status').inner_text() == status('restoreCleared')
        assert page.locator('#restore-input').input_value() == ''
        assert page.locator('#restored-value').inner_text() == ''
        # Return to a checked, concealed result for the remaining UI checks.
        check(shares, 'restoredReady')
    print(name, width, 'restore instructions, diagnostics, edits and clear OK', flush=True)


def ordinary_browser(p, name):
    browser = getattr(p, name).launch(headless=True)
    for width in (320, 390, 1280):
        context = browser.new_context(viewport={'width': width, 'height': 900},
                                      is_mobile=name == 'chromium' and width < 500,
                                      has_touch=width < 500, reduced_motion='reduce')
        page = context.new_page()
        errors = []
        external_requests = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda request: external_requests.append(request.url)
                if request.url.startswith(('http://', 'https://')) else None)
        page.goto(URL)
        assert page.evaluate('() => isSecureContext && !!navigator.mediaDevices?.getUserMedia')
        assert page.evaluate('() => matchMedia("(prefers-reduced-motion: reduce)").matches')
        page.locator('#tab-split').focus()
        page.keyboard.press('ArrowRight')
        assert page.locator('#tab-restore').get_attribute('aria-selected') == 'true'
        assert page.locator('#tab-restore').evaluate('(e) => getComputedStyle(e).outlineStyle') != 'none'
        page.keyboard.press('ArrowLeft')
        assert page.locator('#tab-split').get_attribute('aria-selected') == 'true'
        page.fill('#secret-input', 'Scatter Seeds')
        page.click('#split-button')
        page.wait_for_function('() => document.querySelectorAll("#share-cards .certificate").length === 3')
        assert page.locator('#share-cards .qr-image').count() == 3
        assert page.locator('.certificate').first.evaluate('(e) => e.scrollWidth - e.clientWidth') == 0
        measure(page, (name, width, 'split'))
        if name == 'chromium' and width == 320:
            assert len(PdfReader(io.BytesIO(page.pdf(format='A4', print_background=True))).pages) == 3
            page.check('#print-instructions')
            instruction_pages = len(PdfReader(io.BytesIO(page.pdf(format='A4', print_background=True))).pages)
            assert instruction_pages == 4, instruction_pages
        page.click('#theme')
        assert page.evaluate('() => document.documentElement.dataset.theme') == 'dark'
        if name == 'chromium' and width == 320:
            page.emulate_media(media='print')
            assert page.locator('.certificate').first.evaluate('(e) => getComputedStyle(e).backgroundColor') == 'rgb(255, 255, 255)'
            page.emulate_media(media='screen')
        page.click('#language')
        assert page.locator('#tab-guide').get_attribute('aria-label') == 'Storage guide'
        assert 'All 3 subsets' in page.locator('#split-status').inner_text()
        japanese = page.evaluate('() => document.body.textContent.match(/.{0,20}[\u3040-\u30ff\u3400-\u9fff].{0,20}/g)')
        assert not japanese, [item.encode('ascii', 'replace').decode() for item in (japanese or [])]
        page.click('#tab-restore')
        shares = VECTORS['vectors'][0]['shares']
        page.fill('#restore-input', '\n'.join(shares[:2]))
        page.click('#restore-button')
        assert page.locator('#restored').is_visible()
        assert page.locator('#restored-value').is_hidden()
        page.click('#reveal')
        assert page.locator('#restored-value').inner_text() == 'Scatter Seeds'
        page.fill('#restore-input', shares[0])
        page.click('#restore-button')
        assert page.locator('#restored').is_hidden()
        page.fill('#restore-input', '\n'.join(shares))
        page.click('#restore-button')
        assert page.locator('#check-rows tr').count() == 3
        if name == 'chromium' and width == 320:
            page.fill('#restore-input', '\n'.join([shares[0], forged(shares[1], 3)]))
            page.click('#restore-button')
            assert page.locator('#restored').is_hidden()
            page.fill('#restore-input', '\n'.join([shares[0], shares[1], forged(shares[2], 0)]))
            page.click('#restore-button')
            assert page.locator('#restored').is_visible()
            assert 'x=3' in page.locator('#restore-status').inner_text()
            page.fill('#restore-input', '\n'.join(shares))
            page.click('#restore-button')
        measure(page, (name, width, 'restore'))
        restore_guidance_check(page, name, width)
        page.click('#tab-guide')
        page.fill('#guide-k', '3')
        page.fill('#guide-n', '5')
        measure(page, (name, width, 'guide'))
        help_check(page, name, width)
        assert not errors, errors
        assert not external_requests, external_requests
        print(name, width, 'split/restore/guide/Help OK; overflow 0')
        context.close()
    browser.close()


def camera_test(p):
    if not shutil.which('ffmpeg'):
        print('camera fake video: SKIP (ffmpeg unavailable)')
        return
    work = ROOT / '.work'
    work.mkdir(exist_ok=True)
    gif = work / 'fake-test.gif'
    y4m = work / 'fake-test.y4m'
    share = VECTORS['vectors'][0]['shares'][0]
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(URL)
    data_url = page.evaluate('value => { const q = qrcode(0, "M"); q.addData(value, "Alphanumeric"); q.make(); return q.createDataURL(10, 4); }', share)
    gif.write_bytes(base64.b64decode(data_url.split(',')[1]))
    browser.close()
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-stream_loop', '-1', '-i', str(gif),
                    '-vf', 'pad=640:480:(ow-iw)/2:(oh-ih)/2:white,format=yuv420p',
                    '-frames:v', '150', str(y4m)], check=True)
    args = ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
            '--use-file-for-fake-video-capture=' + str(y4m)]
    browser = p.chromium.launch(headless=True, args=args)
    context = browser.new_context(permissions=['camera'])
    page = context.new_page()
    page.goto(URL)
    page.click('#tab-restore')
    page.click('#camera-button')
    page.wait_for_function('() => document.querySelectorAll("#check-rows tr").length === 1', timeout=15000)
    assert page.locator('#restore-input').input_value() == share
    assert page.locator('#camera-view').is_hidden()
    print('chromium file:// fake QR video: decoded one share and stopped camera')
    browser.close()


with sync_playwright() as playwright:
    ordinary_browser(playwright, 'chromium')
    ordinary_browser(playwright, 'firefox')
    browser = playwright.firefox.launch(headless=True,
                                       firefox_user_prefs={'media.navigator.streams.fake': True,
                                                           'media.navigator.permission.disabled': True})
    page = browser.new_page()
    page.goto(URL)
    count = page.evaluate('async () => { const stream = await navigator.mediaDevices.getUserMedia({video:true}); '
                          'const count = stream.getVideoTracks().length; stream.getTracks().forEach(t => t.stop()); '
                          'return count; }')
    assert count == 1
    page.click('#tab-restore')
    page.click('#camera-button')
    page.wait_for_selector('#stop-camera', state='visible')
    page.wait_for_function('() => document.querySelector("#camera-status").textContent === ScatterMessages.ja.cameraRunning')
    page.click('#stop-camera')
    assert page.locator('#camera-view').is_hidden()
    assert page.locator('#camera-status').inner_text() == page.evaluate('() => ScatterMessages.ja.cameraStopped')
    page.click('#camera-button')
    page.wait_for_function('() => document.querySelector("#camera-status").textContent === ScatterMessages.ja.cameraRunning')
    page.click('#tab-split')
    page.click('#tab-restore')
    assert page.locator('#camera-view').is_hidden()
    assert page.locator('#camera-status').inner_text() == page.evaluate('() => ScatterMessages.ja.cameraStopped')
    print('firefox file:// getUserMedia: live fake track; manual/tab stop messages OK')
    browser.close()
    camera_test(playwright)
