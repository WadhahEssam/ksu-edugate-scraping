const puppeteer = require('puppeteer');
const fs = require('fs');

module.exports = {
  getStudentInformation: async function(id, password) {
    let browser = null;
    let page = null;
    try {
      browser = await puppeteer.launch({headless: true});
      page = await browser.newPage();
      await page.setViewport({height: 1080, width: 1920});
      await page.goto('https://edugate.ksu.edu.sa/ksu/init');
      
      // choosing the student
      await page.waitForSelector('tbody > tr > td > .ui-state-default > .ui-corner-all')
      await page.click('tbody > tr > td > .ui-state-default > .ui-corner-all')
      await page.waitForSelector('body > .pui-dropdown-panel > .pui-dropdown-items-wrapper > .pui-dropdown-items > .pui-dropdown-item:nth-child(2)')
      await page.click('body > .pui-dropdown-panel > .pui-dropdown-items-wrapper > .pui-dropdown-items > .pui-dropdown-item:nth-child(2)')
      
      // entering the id
      await page.waitForSelector("input[name='loginForm:username']")
      await page.click("input[name='loginForm:username']")
      await page.keyboard.type(id);
    
      // entering the password
      await page.waitForSelector("input[name='loginForm:password']")
      await page.click("input[name='loginForm:password']")
      await page.keyboard.type(password);
      await page.keyboard.press('Enter')
    
      await page.waitForNavigation({timeout: 2000});
    
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
  
      const studentInformationJSON = {
        name: name,
        hours: lastHours,
        points: lastPoints,
        gpa: gpa
      }
    
      console.log(studentInformation);
      
      await browser.close();
      return(studentInformationJSON);
    } catch (error) {
      await browser.close();
      return 'Somthing Wrong Happened';
    }

  },
};