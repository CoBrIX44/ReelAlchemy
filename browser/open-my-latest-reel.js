const { chromium } = require("playwright");
const path = require("path");

(async () => {

    const username = "winmini_kitchen_bangalore";

    const browser = await chromium.launchPersistentContext(
        path.resolve("browser/instagram-profile"),
        {
            headless: false,
            viewport: {
                width: 1440,
                height: 900
            }
        }
    );

    const page = await browser.newPage();

    await page.goto(
        `https://www.instagram.com/${username}/`, 
        {
            waitUntil: "domcontentloaded"
        }
    );

    await page.waitForTimeout(3000);

    const reelLinks = new Set();

    for (let i = 0; i < 5; i++) {

        const links = await page.locator("a").evaluateAll(
            anchors =>
                anchors
                    .map(a => a.href)
                    .filter(Boolean)
        );

        for (const url of links) {

            if (
                url.includes(
                    `instagram.com/${username}/reel/`
                )
            ) {
                reelLinks.add(url);
            }
        }

        await page.mouse.wheel(0, 1500);
        await page.waitForTimeout(1000);
    }

    const reels = [...reelLinks];

    if (!reels.length) {
        throw new Error("No personal Reels found.");
    }

    const latestReel = reels[0];

    console.log(
        "Opening latest Reel:",
        latestReel
    );

    await page.goto(latestReel, {
        waitUntil: "domcontentloaded"
    });

    await page.waitForTimeout(5000);

    console.log(
        "Opened:",
        page.url()
    );

    console.log(
        "Video elements:",
        await page.locator("video").count()
    );

})();