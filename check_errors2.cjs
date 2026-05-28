const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle2'});
  const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log("Root length:", rootHtml.length);
  await browser.close();
})();
