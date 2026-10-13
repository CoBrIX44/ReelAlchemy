const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

(async () => {
    console.log("Starting ReelAlchemy Launch Video Render...");
    const tStart = Date.now();

    const FPS = 30;
    const DURATION = 20.0;
    const TOTAL_FRAMES = Math.round(FPS * DURATION); // 600 frames

    const workDir = __dirname;
    const outDir = path.resolve(workDir, "..");
    const audioPath = path.join(workDir, "brag_audio.wav");
    const mp4OutPath = path.join(outDir, "brag.mp4");
    const posterPath = path.join(outDir, "brag.jpg");

    // Copy still_scene5.jpg to brag.jpg as the official poster
    const scene5Path = path.join(workDir, "still_scene5.jpg");
    if (fs.existsSync(scene5Path)) {
        fs.copyFileSync(scene5Path, posterPath);
        console.log("Poster saved to:", posterPath);
    }

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    const htmlPath = "file://" + path.resolve(workDir, "render.html").replace(/\\/g, "/");
    await page.goto(htmlPath, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // If poster didn't exist, capture it now at t=18.0
    if (!fs.existsSync(posterPath)) {
        await page.evaluate(() => window.renderFrame(18.0));
        await page.screenshot({ path: posterPath, type: "jpeg", quality: 95 });
        console.log("Poster generated and saved to:", posterPath);
    }

    const posterBuffer = fs.readFileSync(posterPath);

    // Spawn FFmpeg to encode H.264 video with AAC audio
    const ffmpegArgs = [
        "-y",
        "-f", "image2pipe",
        "-vcodec", "mjpeg",
        "-r", String(FPS),
        "-i", "-",
        "-i", audioPath,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        mp4OutPath
    ];

    console.log("Launching FFmpeg process...");
    const ffmpeg = spawn("ffmpeg", ffmpegArgs, { stdio: ["pipe", "inherit", "inherit"] });

    // Stream frames to FFmpeg
    console.log(`Piping ${TOTAL_FRAMES} frames to FFmpeg at 1920x1080...`);

    for (let f = 0; f < TOTAL_FRAMES; f++) {
        if (f === 0) {
            // Frame 0: baked-in poster frame for instant platform thumbnail
            ffmpeg.stdin.write(posterBuffer);
        } else {
            const t = f / FPS;
            await page.evaluate((curT) => window.renderFrame(curT), t);
            const frameBuf = await page.screenshot({ type: "jpeg", quality: 92 });
            ffmpeg.stdin.write(frameBuf);
        }

        if (f % 60 === 0 || f === TOTAL_FRAMES - 1) {
            const pct = Math.round((f / TOTAL_FRAMES) * 100);
            const elapsed = ((Date.now() - tStart) / 1000).toFixed(1);
            console.log(`Render progress: ${f}/${TOTAL_FRAMES} frames (${pct}%) [${elapsed}s]`);
        }
    }

    ffmpeg.stdin.end();

    await new Promise((resolve, reject) => {
        ffmpeg.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`FFmpeg exited with code ${code}`));
        });
        ffmpeg.on("error", reject);
    });

    await browser.close();

    const totalSeconds = ((Date.now() - tStart) / 1000).toFixed(1);
    console.log(`\n🎉 SUCCESS! Render completed in ${totalSeconds}s.`);
    console.log(`Deliverable video: ${mp4OutPath}`);
})();
