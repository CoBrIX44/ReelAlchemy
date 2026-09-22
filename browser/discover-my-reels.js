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

    const profileUrl =
        `https://www.instagram.com/${username}/`;

    await page.goto(profileUrl, {
        waitUntil: "domcontentloaded"
    });

    await page.waitForTimeout(4000);

    const reelLinks = new Set();

    for (let i = 0; i < 8; i++) {

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

        console.log(
            `Scroll ${i + 1}/8 — found ${reelLinks.size} Reels`
        );

        await page.mouse.wheel(0, 1500);

        await page.waitForTimeout(1500);
    }

    const reels = [...reelLinks];

    console.log("\nYOUR REELS:");

    reels.forEach((url, index) => {
        console.log(`${index + 1}. ${url}`);
    });

    await browser.close();

})();