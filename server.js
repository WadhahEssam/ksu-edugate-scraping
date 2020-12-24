const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const utils = require("./utils");
const revenueCatAPI = require("./revenueCatAPI");
const env = require("./env");
const puppeteer = require("puppeteer");
const timeout = require("connect-timeout");

let browser = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function launchBrowser() {
  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--enable-blink-features=HTMLImports",
    ],
  });
}
launchBrowser();

const app = express();
const PORT = env.port;

app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use(timeout("100s"));

app.get("/", (req, res) => {
  console.log(req);
  res.send("Hello World");
});

app.post("/getStudentInformation", async (req, res) => {
  console.log(req.body);
  try {
    let openPages = await browser.pages();
    while (openPages.length !== 1) {
      await sleep(200);
      openPages = await browser.pages();
    }
    const page = await browser.newPage();
    const studentInformation = await utils.getStudentInformation(
      req.body.id,
      req.body.password,
      page
    );
    res.json(studentInformation);
  } catch (err) {
    console.log(err.message);
    res.send("Somthing Wrong Happened");
  }
});

app.post("/getRevenueCatInformation", async (req, res) => {
  // console.log(req.body);
  let newBrowser;
  try {
    newBrowser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--enable-blink-features=HTMLImports",
      ],
    });
    const page = await newBrowser.newPage();

    const revenueCatInformation = await revenueCatAPI.getRevenueCatInformation({
      email: req.body.email,
      password: req.body.password,
      hash: req.body.hash,
      page,
    });
    newBrowser.close();
    res.json(revenueCatInformation);
  } catch (err) {
    if (newBrowser !== undefined) {
      newBrowser.close();
    }
    console.log(err.message);
    res.send("Somthing Wrong Happened");
  }
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`));
