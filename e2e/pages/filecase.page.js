// e2e/pages/filecase.page.js
class FileCasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // Case type step
    this.proceedBtn = page.getByRole('button', { name: /proceed/i });
    this.cancelBtn = page.getByRole('button', { name: /cancel/i });

    // Checklist step
    this.downloadChecklistBtn = page.getByRole('button', { name: /download/i });
    this.startFilingBtn = page.getByRole('button', { name: /start filing/i });

    // Filing wizard steps (left panel titles)
    this.stepLitigant = page.getByText(/1\.?\s*Litigant Details/i);
    this.stepCaseSpecific = page.getByText(/2\.?\s*Case Specific Details/i);
    this.stepAdditional = page.getByText(/3\.?\s*Additional Details/i);
    this.stepPayment = page.getByText(/4\.?\s*Payment Confirmation/i);
    this.stepReview = page.getByText(/5\.?\s*Review \& Sign/i);

    // First content section in wizard
    this.complainantDetailsHeader = page.getByText(/Complainant Details/i);
    this.continueBtn = page.getByRole('button', { name: /continue/i });
    this.saveDraftBtn = page.getByRole('button', { name: /save as draft/i });
  }

  async openFromHome() {
    await this.page.goto('/ui/citizen/dristi/home/file-case');
  }

  async proceedFromCaseType() {
    await this.proceedBtn.click();
  }

  async startFiling() {
    await this.startFilingBtn.click();
    await this.page.waitForURL(/file-case\/case/);
  }
}

module.exports = { FileCasePage };
