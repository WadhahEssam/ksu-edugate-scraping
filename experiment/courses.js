const puppeteer = require('puppeteer');
const fs = require('fs');
const NUMBER_OF_MAJORS = 182;

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setViewport({height: 1080, width: 1920});
  await page.goto('https://edugate.ksu.edu.sa/ksu/ui/guest/timetable/index/scheduleTreeCoursesIndex.faces');
  
  // getting the names of the majors
    const {faculties, allMajors} = await page.evaluate((NUMBER_OF_MAJORS) => {
        let numberOfFaculties = 18
        let faculties = [];
        let majors = [];
        let allMajors = [];
        let majorNameCount = 0;
        for(let i = 1; i <= numberOfFaculties; i++) {
            const majorName = document.querySelectorAll('#dtree0 > div')[majorNameCount].textContent;
            majorNameCount = majorNameCount + 2;
            const numberOfMajors = document.querySelectorAll('.clip')[i].children.length;
            for (let j = 0; j < numberOfMajors; j++) {
                const currentMajor = document.querySelectorAll('.clip')[i].children[j].textContent;
                majors.push(currentMajor);
                allMajors.push(currentMajor);
            }
            faculties.push({faculty: majorName, numberOfMajors: numberOfMajors, Majors: majors});
            majors = [];
        }

        return {faculties, allMajors};
    }, NUMBER_OF_MAJORS);
    let university = {university: faculties};
    // fs.writeFileSync("courses.json", JSON.stringify(university), 'utf8'); 
    
    let allCourses = {};
    // looping throw all the faculties 
    for (let i = 1; i <= NUMBER_OF_MAJORS; i++) {
        await page.evaluate((i) => {
            window.setIndex(i);
        }, i)
        await page.waitForNavigation();

        const courses = await page.evaluate(() => {
            // helper function 
            function getAttribute(j) {
                switch (j) {
                    case 0: 
                        return 'رمز المقرر';
                    case 1:
                        return 'اسم المقرر';
                    case 2: 
                        return 'الشعبة';
                    case 3:
                        return 'النشاط';
                    case 4:
                        return 'الساعات';
                    case 5:
                        return 'الجنس';
                    case 6:
                        return 'الحالة';
                }
            }

            var courses = [];
            var numberOfCourses = document.querySelectorAll('tbody')[26].children.length;
            for (var i = 0; i < numberOfCourses; i++) {
                var course = {};
                var numberOfAttributes = 7;
                course['رقم المقرر'] = i+1;
                for (var j = 0; j < numberOfAttributes; j++) {
                    var courseAttribute = document.querySelectorAll('tbody')[26].children[i].children[j].textContent;
                    course[getAttribute(j)] = courseAttribute;
                }
                courses.push(course);
            }

            return courses;
        });

        console.log(`${i} out of ${NUMBER_OF_MAJORS}`)
        fs.writeFileSync(`../files/courses/${allMajors[i]}.json`, JSON.stringify(courses), 'utf8'); 
        allCourses[`${allMajors[i]}`] = courses;


        // await page.screenshot({path: `files/edugate_${i}.png`});
        await page.goBack();
    }

    fs.writeFileSync("../files/courses/courses.json", JSON.stringify(allCourses), 'utf8'); 


  await browser.close();

})();

