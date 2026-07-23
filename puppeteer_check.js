const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Attempt to log in if we see the login screen
    const usernameInput = await page.$('input[type="text"]');
    if (usernameInput) {
      console.log('Logging in...');
      await page.type('input[type="text"]', 'admin');
      await page.type('input[type="password"]', 'admin'); // Assuming default admin/admin
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
      await page.waitForTimeout(2000); // Wait for animations
    }

    // Click on POS Terminal
    console.log('Navigating to POS Terminal...');
    const posButton = await page.$x("//li[contains(., 'POS Terminal')]");
    if (posButton.length > 0) {
      await posButton[0].click();
      await page.waitForTimeout(2000); // Wait for it to crash or load
    } else {
      console.log('Could not find POS Terminal button.');
    }

  } catch (err) {
    console.error('Script Error:', err);
  } finally {
    await browser.close();
  }
})();
