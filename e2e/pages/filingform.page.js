// e2e/pages/filingform.page.js
class FilingFormPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // Generic selectors for a dynamic form
    this.submitBtn = page.getByRole('button', { name: /submit|proceed|continue/i }).first();
    this.nextBtn = page.getByRole('button', { name: /next/i }).first();
    this.saveBtn = page.getByRole('button', { name: /save/i }).first();
  }

  async fillRequiredFields() {
    // Heuristic: fill all visible required inputs/selects/textareas with test data
    const requiredInputs = this.page.locator('input[required], textarea[required], select[required]');
    const count = await requiredInputs.count();
    for (let i = 0; i < count; i++) {
      const el = requiredInputs.nth(i);
      const tag = await el.evaluate((e) => e.tagName.toLowerCase());
      if (tag === 'select') {
        const options = await el.locator('option').allTextContents();
        const value = options.find((o) => o && o.trim().length) || '';
        if (value) await el.selectOption({ label: value.trim() });
      } else if (tag === 'textarea') {
        await el.fill('Test data for automated filing.');
      } else {
        const type = await el.evaluate((e) => e.getAttribute('type'));
        if (type === 'checkbox') {
          await el.check().catch(() => {});
        } else if (type === 'radio') {
          await el.check().catch(() => {});
        } else if (type === 'file') {
          // skip here; document upload handled in signing/doc step
        } else {
          await el.fill('Test');
        }
      }
    }
  }

  async proceed() {
    if (await this.nextBtn.isVisible()) {
      await this.nextBtn.click();
      return;
    }
    if (await this.submitBtn.isVisible()) {
      await this.submitBtn.click();
      return;
    }
  }
}

module.exports = { FilingFormPage };
