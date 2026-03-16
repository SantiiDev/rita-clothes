import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[CONSOLE] ${msg.type().toUpperCase()} - ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`[ERROR] ${error.message}`);
  });

  page.on('requestfailed', request => {
    console.log(`[REQ FAILED] ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  } catch (err) {
    console.log('Goto Error:', err.message);
  } finally {
    await browser.close();
  }
})();
