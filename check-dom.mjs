import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' }).catch(() => {});
  
  const innerHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.innerHTML : 'NO ROOT';
  });
  
  console.log('--- ROOT HTML ---');
  console.log(innerHTML);
  
  await browser.close();
})();
