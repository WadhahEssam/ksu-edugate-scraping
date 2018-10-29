const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const utils = require('./utils');
const env = require('./env');
const puppeteer = require('puppeteer');

let browser = null;

async function launchBrowser() {
  browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox']});
}

launchBrowser();

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
    const openPages = await browser.pages();
    console.log(openPages);
    const page = await browser.newPage();
    const studentInformation = await utils.getStudentInformation(req.body.id, req.body.password, page);
    res.json(studentInformation);
  }
  catch (err) {
    console.log(err.message);
    res.send('Somthing Wrong Happened');
  } 
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`));


