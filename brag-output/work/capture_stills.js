const { chromium } = require("playwright");
const path = require("path");

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    
    const htmlPath = "file://" + path.resolve(__dirname, "render.html").replace(/\\/g, "/");
    await page.goto(htmlPath, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000); // Wait for fonts and assets

    const times = [
        { t: 1.8, name: "still_scene1.jpg" },
        { t: 3.5, name: "still_trans_1_2.jpg" },
        { t: 5.5, name: "still_scene2.jpg" },
        { t: 7.5, name: "still_trans_2_3.jpg" },
        { t: 10.0, name: "still_scene3.jpg" },
        { t: 12.0, name: "still_trans_3_4.jpg" },
        { t: 14.5, name: "still_scene4.jpg" },
        { t: 18.0, name: "still_scene5.jpg" }
    ];

    for (const item of times) {
        await page.evaluate((t) => window.renderFrame(t), item.t);
        const outPath = path.join(__dirname, item.name);
        await page.screenshot({ path: outPath, type: "jpeg", quality: 92 });
        console.log(`Captured ${item.name} at t=${item.t}s`);
    }

    await browser.close();
    console.log("All stills captured successfully!");
})();
