const path = require('path');
const fs = require('fs');

const resolveFromUiE2E = (...parts) => path.join(__dirname, '..', '..', ...parts);

class BasePage {
  constructor(page, globals) {
    this.page = page;
    this.globals = globals || {};
  }

  async goto(path = '') {
    const base = (this.globals.baseURL || '').replace(/\/+$/, '');
    const rel = String(path || '').replace(/^\/+/, '');
    const target = rel ? `${base}/${rel}` : base;
    
    await this.page.goto(target, { 
      waitUntil: 'domcontentloaded',
      timeout: 90000 // 90 seconds for CI/CD environments
    });
    
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 60000 });
    } catch {
      // networkidle didn't settle within 60s (common on demo server under load)
      // 'load' event already fired via domcontentloaded above — safe to continue
      console.warn('[BasePage] networkidle timeout — page loaded, continuing...');
    }
  }

  async waitIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  async clickContinue() {
    const btn = this.page.getByRole('button').filter({ hasText: 'Continue' });
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.click();
  }

  async upload(inputSelector, filePath) {
    await this.page.locator(inputSelector).setInputFiles(filePath);
  }

  async fillOtpSixOnes(prefixSelector = '') {
    const first = prefixSelector
      ? this.page.locator(`${prefixSelector} .input-otp`).first()
      : this.page.locator('.input-otp').first();
    await first.fill('1');
    await this.page.locator('input:nth-child(2)').fill('2');
    await this.page.locator('input:nth-child(3)').fill('3');
    await this.page.locator('input:nth-child(4)').fill('4');
    await this.page.locator('input:nth-child(5)').fill('5');
    await this.page.locator('input:nth-child(6)').fill('6');
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * Clicks a "click here" download link and saves the resulting PDF.
   * Handles three QA behaviours: direct download, new-tab PDF, or neither
   * (falls back to the most recently downloaded PDF in downloads/).
   *
   * @param {import('@playwright/test').Locator} [clickLocator] - defaults to getByText('click here')
   * @returns {Promise<string>} absolute path to the saved PDF
   */
  async clickAndSavePdf(clickLocator) {
    const target = clickLocator || this.page.getByText('click here');

    // Wait for the link to appear (PDF preview needs to render fully)
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(3000);
    await target.waitFor({ state: 'visible', timeout: 60000 });
    await target.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);

    // Race download vs popup — both set up BEFORE the click
    const downloadP = this.page.waitForEvent('download', { timeout: 15000 })
      .then(d => ({ type: 'download', value: d })).catch(() => null);
    const popupP = this.page.waitForEvent('popup', { timeout: 15000 })
      .then(p => ({ type: 'popup', value: p })).catch(() => null);

    await target.click();

    const result = await Promise.race([downloadP, popupP]);

    let pdfPath;
    if (result && result.type === 'download') {
      pdfPath = path.join(resolveFromUiE2E('downloads'), await result.value.suggestedFilename());
      fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
      await result.value.saveAs(pdfPath);
      console.log('[BasePage] PDF downloaded:', path.basename(pdfPath));
    } else if (result && result.type === 'popup') {
      const popup = result.value;
      await popup.waitForLoadState('domcontentloaded').catch(() => {});
      const pdfUrl = popup.url();
      await popup.close();
      const response = await this.page.request.get(pdfUrl);
      pdfPath = path.join(resolveFromUiE2E('downloads'), 'signed-order.pdf');
      fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
      fs.writeFileSync(pdfPath, await response.body());
      console.log('[BasePage] PDF fetched from new tab');
    } else {
      const downloadsDir = resolveFromUiE2E('downloads');
      const pdfs = fs.existsSync(downloadsDir)
        ? fs.readdirSync(downloadsDir).filter(f => f.endsWith('.pdf')).sort()
        : [];
      if (pdfs.length === 0) throw new Error('[BasePage] No PDF available to upload');
      pdfPath = path.join(downloadsDir, pdfs[pdfs.length - 1]);
      console.log('[BasePage] Fallback: using existing PDF:', path.basename(pdfPath));
    }

    return pdfPath;
  }
}

module.exports = { BasePage };
