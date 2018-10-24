const puppeteer = require('puppeteer');
const fs = require('fs');
const CREDS = require('./creds');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setViewport({height: 1080, width: 1920});
  await page.goto('https://edugate.ksu.edu.sa/ksu/init');
  
  // choosing the student
  await page.waitForSelector('tbody > tr > td > .ui-state-default > .ui-corner-all')
  await page.click('tbody > tr > td > .ui-state-default > .ui-corner-all')
  await page.waitForSelector('body > .pui-dropdown-panel > .pui-dropdown-items-wrapper > .pui-dropdown-items > .pui-dropdown-item:nth-child(2)')
  await page.click('body > .pui-dropdown-panel > .pui-dropdown-items-wrapper > .pui-dropdown-items > .pui-dropdown-item:nth-child(2)')
  
  // entering the username
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
  let name = await page.evaluate((sel) => {
    return document.querySelector('html body center div#center div#data div#left div.data_in table tbody tr td.n41 p span#studNameText').textContent;
  });

  // div.data_in_2:nth-child(2) > ul:nth-child(1) > li:nth-child(3)
  let phoneNumber = await page.evaluate((sel) => {
    return document.querySelector('div.data_in_2:nth-child(2) > ul:nth-child(1) > li:nth-child(3)').textContent.split(':')[1].trim();
  });

  let gpa = await page.evaluate((sel) => {
    return document.querySelector('#myForm > div.data_in_2.right_dash > ul > li:nth-child(4)').textContent.split(':')[1].trim();
  });

  await page.goto("https://edugate.ksu.edu.sa/ksu/ui/student/student_transcript/index/studentTranscriptAllIndex.faces");
  
  let lastHours = await page.evaluate((sel) => {
    return document.querySelector('#myForm\\:allTranscriptTable\\:1\\:default > div:nth-child(2) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(2) > td:nth-child(3)')
      .textContent;
  });

  let lastPoints = await page.evaluate((sel) => {
    return document.querySelector('#myForm\\:allTranscriptTable\\:1\\:default > div:nth-child(2) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(2) > td:nth-child(5)')
      .textContent;
  });


  const studentInformation = (`
  Student Name   : ${name}
  Phone Number   : ${phoneNumber}
  Hours taken    : ${lastHours}
  Current Points : ${lastPoints}
  Current GPA    : ${gpa}
  ///////////////////////////////////////////////////
  `);

  console.log(studentInformation);
  fs.appendFileSync("information.txt", studentInformation); 

  // await page.screenshot({path: 'files/edugate.png'});
  await browser.close();
})();

