const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const utils = require('./utils');
const env = require('./env');
const puppeteer = require('puppeteer');

let browser = null;

async function launchBrowser() {
  browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
}

launchBrowser();
console.log(browser);

const app = express();
const PORT = env.port;

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
  console.log(req);
  res.send('Hello World');
});

app.post('/getStudentInformation', async (req, res) => {
  console.log(req.body);
  try {
    const page = await browser.newPage();
    const studentInformation = await utils.getStudentInformation(req.body.id, req.body.password, browser, page);
    res.json(studentInformation);
  }
  catch (err) {
    console.log(err);
    res.send('Somthing Wrong Happened');
  } 
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`));


