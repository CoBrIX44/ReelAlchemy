const { chromium } = require("playwright");
const path = require("path");

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body style="margin:0; background:#0B0F19; color:white; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
            <h1 style="font-size:64px; color:#F59E0B;">ReelAlchemy Render Test</h1>
        </body>
        </html>
    `);
    const t0 = Date.now();
    await page.screenshot({ path: path.join(__dirname, "test_frame.png") });
    console.log("Screenshot took:", Date.now() - t0, "ms");
    await browser.close();
})();
