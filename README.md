# ksu-edugate-scraping
Using king saud university edugate website to get a specific student information 

## Motivation
Aroung two years ago I developed a GPA calculator for king saud university [KSU-GPA](https://wadhahessam.github.io/ksu-gpa/), but in order
to calculate the gpa of any student I needed information about the current gpa/points and the amount of hours a student has taken in the past. and those infromation
were hard to keep in mind since they are not that important *(at least for me)*, so in order to 
get this info students have to go to the university website and login and get it, but still it was a little bit tricky to find it. 

Although some students tried asking unviersity for an API to develope useful apps like this but unviersity declined them all, since then I have been 
trying to find a way to get around this and deal with the university website as an API and finally I secceeded with the use of google chromium
headless browser and the [puppeteer](https://github.com/GoogleChrome/puppeteer) amazing library.

## What it does
providing a student id and username the application can scrap the university website and get your ( gpa , points , hours ) as easy as it sounds.
