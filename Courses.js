const puppeteer = require('puppeteer');
const fs = require('fs');
const NUMBER_OF_MAJORS = 182;

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setViewport({height: 1080, width: 1920});
  await page.goto('https://edugate.ksu.edu.sa/ksu/ui/guest/timetable/index/scheduleTreeCoursesIndex.faces');
  
  // getting the names of the majors
    const faculties = await page.evaluate((NUMBER_OF_MAJORS) => {
        let numberOfFaculties = 18
        let faculties = [];
        let majors = [];
        let majorNameCount = 0;
        for(let i = 1; i <= numberOfFaculties; i++) {
            const majorName = document.querySelectorAll('#dtree0 > div')[majorNameCount].textContent;
            majorNameCount = majorNameCount + 2;
            const numberOfMajors = document.querySelectorAll('.clip')[i].children.length;
            for (let j = 0; j < numberOfMajors; j++) {
                majors.push(document.querySelectorAll('.clip')[i].children[j].textContent);
            }
            faculties.push({faculty: majorName, numberOfMajors: numberOfMajors, Majors: majors});
            majors = [];
        }

        return faculties;
    }, NUMBER_OF_MAJORS);
    
    let university = {university: faculties};
    fs.writeFileSync("courses.json", JSON.stringify(university), 'utf8'); 
    
  for (let i = 1; i <= 5; i++) {
    await page.evaluate((i) => {
        window.setIndex(i);
    }, i)
    await page.waitForNavigation();
    const numberOfCourses = await page.evaluate(() => {
        return document.querySelectorAll('tbody')[26].children.length;
    });

    // const Courses = await page.evaluate(() => {
    //     return document.querySelectorAll('tbody')[26].children.length;
    // });

    console.log(numberOfCourses);

    await page.screenshot({path: `files/edugate_${i}.png`});
    await page.goBack();
  }
  await browser.close();
})();

// #dtree1 > div:nth-child(1)
// #dtree1 > div:nth-child(2)