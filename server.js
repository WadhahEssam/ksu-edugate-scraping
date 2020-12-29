const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const utils = require("./utils");
const revenueCatAPI = require("./revenueCatAPI");
const env = require("./env");
const puppeteer = require("puppeteer");
const timeout = require("connect-timeout");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

app.post("/getRevenueCatInformation2", async (req, res) => {
  console.log(req.body);
  try {
    const response = {
      generalStats: [
        {
          "Active Trials": "7",
        },
        {
          "Active Subscriptions": "11",
        },
        {
          MRR: "$78",
        },
        {
          Revenue: "$98",
        },
        {
          Installs: "12,773",
        },
        {
          "Active Users": "15,899",
        },
      ],
      transactions: [
        {
          userID: "j2b0oTDUZg-X721amDeoF",
          product: "fadfadah_199_1w_3d0",
          revenue: "Trial",
          purchased: "28 minutes ago",
          expiration: "in 3 days",
          renewal: false,
        },
        {
          userID: "KtXl8gxQl9-6MMPMbzkuf",
          product: "fadfadah_199_1w_3d0",
          revenue: "Trial",
          purchased: "7 hours ago",
          expiration: "in 3 days",
          renewal: false,
        },
        {
          userID: "wikLAyJcon-9eHlcbllYk",
          product: "fadfadah_199_1w_3d0",
          revenue: "$2.40",
          purchased: "a day ago",
          expiration: "in 6 days",
          renewal: true,
        },
        {
          userID: "r25JWeIGya-QIh7sSvsXz",
          product: "fadfadah_199_1w_3d0",
          revenue: "$0.00",
          purchased: "a day ago",
          expiration: "a day ago",
          renewal: true,
        },
      ],
    };
    res.json(response);
  } catch (err) {
    console.log(err.message);
    res.send("Somthing Wrong Happened");
  }
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`));
