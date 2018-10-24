const puppeteer = require('puppeteer');
const CREDS = require('./creds');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setViewport({height: 1080, width: 1920});
  await page.goto('https://edugate.ksu.edu.sa/ksu/init');
  
  // choosing the student
  await page.waitForSelector('tbody > tr > td > .ui-state-default > .ui-corner-all')
  await page.click('tbody > tr > td > .ui-state-default > .ui-corner-all')
  await page.waitForSelector('body > .pui-dropdown-panel > .pui-dropdown-items-wrapper > .pui-dropdown-items > .pui-dropdown-item:nth-child(2)')
  await page.click('body > .pui-dropdown-panel > .pui-dropdown-items-wrapper > .pui-dropdown-items > .pui-dropdown-item:nth-child(2)')
  
  // entering the password
  await page.waitForSelector("input[name='loginForm:username']")
  await page.click("input[name='loginForm:username']")
  await page.keyboard.type(CREDS.id);

  // entering the password
  await page.waitForSelector("input[name='loginForm:password']")
  await page.click("input[name='loginForm:password']")
  await page.keyboard.type(CREDS.password);
  await page.keyboard.press('Enter')

  await page.waitForNavigation();

  // getting the current gpa
  let gpa = await page.evaluate((sel) => {
    return document.querySelector('#myForm > div.data_in_2.right_dash > ul > li:nth-child(4)').textContent.split(':')[1].trim();
  });

  console.log(gpa);

  await page.screenshot({path: 'files/edugate.png'});
  await browser.close();
})();

