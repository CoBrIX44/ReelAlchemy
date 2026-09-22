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

    // CHANGE THIS
    const username = "winmini_kitchen_bangalore";

    // Open YOUR profile
    await page.goto(
        `https://www.instagram.com/${username}/`,
        {
            waitUntil: "domcontentloaded"
        }
    );

    console.log("Opened your Instagram profile.");

    // Give Instagram time to render
    await page.waitForTimeout(3000);

    console.log("Current URL:", page.url());

})();