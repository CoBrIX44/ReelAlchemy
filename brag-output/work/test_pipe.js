const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.setContent(`
        <html><body style="margin:0; background:#111; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh;">
        <h1 id="t" style="font-size:80px;">0</h1>
        <script>
            window.setFrame = (n) => { document.getElementById('t').innerText = 'Frame ' + n; };
        </script>
        </body></html>
    `);

    const ffmpeg = spawn("ffmpeg", [
        "-y",
        "-f", "image2pipe",
        "-vcodec", "mjpeg",
        "-r", "30",
        "-i", "-",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        path.join(__dirname, "pipe_test.mp4")
    ]);

    const t0 = Date.now();
    for (let i = 0; i < 30; i++) {
        await page.evaluate((n) => window.setFrame(n), i);
        const buf = await page.screenshot({ type: "jpeg", quality: 85 });
        ffmpeg.stdin.write(buf);
    }
    ffmpeg.stdin.end();

    await new Promise((resolve) => ffmpeg.on("close", resolve));
    console.log("30 frames piped & encoded in:", Date.now() - t0, "ms");
    await browser.close();
})();
