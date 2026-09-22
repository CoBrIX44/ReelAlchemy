const { chromium } = require("playwright");

(async () => {

    const browser = await chromium.launchPersistentContext(
        "./browser/instagram-profile",
        {
            headless: false,
            viewport: {
                width: 1440,
                height: 900
            }
        }
    );

    const page = await browser.newPage();

    await page.goto("https://www.instagram.com/", {
        waitUntil: "domcontentloaded"
    });

    console.log("Instagram opened using saved session.");

})();