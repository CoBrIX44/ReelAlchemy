const { chromium } = require("playwright");
const path = require("path");

(async () => {
    const videoDir = path.join(__dirname, "video_test");
    const browser = await chromium.launch();
    const context = await browser.newContext({
        recordVideo: {
            dir: videoDir,
            size: { width: 1920, height: 1080 }
        },
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    await page.setContent(`
        <html>
        <body style="margin:0; background:#0B0F19; color:white; display:flex; align-items:center; justify-content:center; height:100vh;">
            <h1 id="txt" style="font-size:72px; color:#F59E0B;">Frame Test</h1>
            <script>
                let count = 0;
                setInterval(() => {
                    document.getElementById('txt').innerText = 'Frame ' + (++count);
                }, 50);
            </script>
        </body>
        </html>
    `);
    await page.waitForTimeout(3000);
    await page.close();
    await context.close();
    await browser.close();
    console.log("Recorded video successfully in video_test!");
})();
