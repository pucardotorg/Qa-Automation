async function tryClick(locator, options = {}) {
  try {
    await locator.waitFor({ state: 'visible', timeout: 2000 });
    await locator.click(options);
    return true;
  } catch {
    return false;
  }
}

module.exports = { tryClick };
