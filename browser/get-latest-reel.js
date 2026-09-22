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

    await page.waitForTimeout(4000);

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

        console.error(
            JSON.stringify({
                success: false,
                error: "No personal Reels found"
            })
        );

        await browser.close();
        process.exit(1);
    }

    const latestReel = reels[0];

    console.log(
        JSON.stringify({
            success: true,
            reel_url: latestReel,
            discovered_count: reels.length
        })
    );

    await browser.close();

})();