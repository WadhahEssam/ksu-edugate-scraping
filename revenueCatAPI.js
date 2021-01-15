const puppeteer = require("puppeteer");
const fs = require("fs");

async function getGeneralStats({ page }) {
  return await page.evaluate((sel) => {
    return Array.from(document.querySelectorAll(".stat-card")).map(
      (stateCard) => {
        return {
          [stateCard.children[0].textContent]:
            stateCard.children[1].children[0].children[0].textContent,
        };
      }
    );
  });
}

async function login({ email, password, page }) {
  // entering the email
  await page.waitForSelector("#input-email");
  await page.click("#input-email");
  await page.keyboard.type(email);

  // entering the password
  await page.waitForSelector("#input-password");
  await page.click("#input-password");
  await page.keyboard.type(password);

  await page.keyboard.press("Enter");
}

async function getTransactionsForCurrentPage({ page }) {
  return await page.evaluate((sel) => {
    return Array.from(
      document.querySelectorAll(
        "#root > div > div > div > div.card.mb-3.shadow-sm > div > table > tbody > tr"
      )
    ).map((transactionRow) => {
      return {
        userID: transactionRow.children[0].textContent,
        product: transactionRow.children[1].textContent,
        revenue: transactionRow.children[2].textContent,
        purchased: transactionRow.children[3].textContent,
        expiration: transactionRow.children[4].textContent,
        renewal: transactionRow.children[5].children[0].classList.contains(
          "fa-check-square"
        ),
      };
    });
  });
}

const getHashForNextTransaction = ({ transaction }) => {
  return `${transaction.userID}${transaction.product}${transaction.revenue}`;
};

const getHashForThreeNextTransactions = ({ transactions, position }) => {
  if (position + 2 < transactions.length - 1) {
    return `${getHashForNextTransaction({
      transaction: transactions[position],
    })}${getHashForNextTransaction({
      transaction: transactions[position + 1],
    })}${getHashForNextTransaction({
      transaction: transactions[position + 2],
    })}`;
  }
};

// if it returns undefined, then you don't have to do anything
const hasNewTransactions = ({ transactions, hash }) => {
  if (hash === undefined) {
    return false;
  }
  for (let i = 0; i < transactions.length; i++) {
    const transactionHash = getHashForThreeNextTransactions({
      transactions,
      position: i,
    });
    if (transactionHash !== undefined) {
      if (transactionHash === hash) {
        if (i === 0) {
          return false;
        }
        return true;
      }
    }
  }
  return true;
};

async function getTransactions({ hash, page }) {
  const allTransactionsButton =
    "#root > div > div > div > div.card.mb-3.shadow-sm > div > table > tfoot > tr > th > a";
  const tableFooter =
    "#root > div > div > div > div.card.mb-3.shadow-sm > div > table > tfoot";
  const olderButton =
    "#root > div > div > div > div.card.mb-3.shadow-sm > div > table > tfoot > tr > td > div > nav > ul > li:nth-child(2) > a";
  const noMoreTransactionsDiv =
    "#root > div > div > div > div.card.mb-3.shadow-sm > div > div.d-flex.justify-content-center.align-items-center.w-100 > h4";

  await page.click(allTransactionsButton);
  await page.waitForSelector(tableFooter);

  let transactions = [];

  while (true) {
    await page.waitFor(200);
    if ((await page.$(olderButton)) === null) {
      break;
    }

    let transactionsForCurrentPage = await getTransactionsForCurrentPage({
      page,
    });

    if (
      Array.isArray(transactionsForCurrentPage) &&
      transactionsForCurrentPage.length > 0
    ) {
      transactions = [...transactions, ...transactionsForCurrentPage];
    }

    // shouldReturnTransactions({ transactions, hash }) !== undefined
    if ( transactions.length >= 30) {
      break;
    }

    await page.click(olderButton);
    try {
      await page.waitForSelector(olderButton, { timeout: 4000 });
    } catch (e) {
      // just catching
    }
  }

  return {
    transactions,
    hasNewTransactions: hasNewTransactions({ transactions, hash }),
  };
}

module.exports = {
  getRevenueCatInformation: async function ({ email, password, hash, page }) {
    try {
      await page.setViewport({ height: 1080, width: 1920 });
      await page.goto("https://app.revenuecat.com/overview");
      await page.setCacheEnabled(false);

      await login({ email, password, page });

      await page.waitForNavigation({
        timeout: 6000,
        waitUntil: "networkidle0",
      });

      const generalStats = await getGeneralStats({ page });
      const transactionsResult = await getTransactions({ hash, page });

      const response = {
        generalStats,
        transactions: transactionsResult.transactions,
        hasNewTransactions: transactionsResult.hasNewTransactions,
      };

      await page.close();

      return response;
    } catch (error) {
      await page.close();
      console.log(error);
      return "Somthing Wrong Happened";
    }
  },
};
