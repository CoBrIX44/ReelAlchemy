const { chromium } = require("playwright");
const fs = require("fs");
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

    try {

        // ==================================================
        // 1. OPEN YOUR PROFILE
        // ==================================================

        console.log("Opening your Instagram profile...");

        await page.goto(
            `https://www.instagram.com/${username}/`,
            {
                waitUntil: "domcontentloaded"
            }
        );

        await page.waitForTimeout(4000);


        // ==================================================
        // 2. FIND YOUR REELS
        // ==================================================

        console.log("Finding your Reels...");

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

            await page.waitForTimeout(1200);
        }

        const reels = [...reelLinks];

        if (!reels.length) {
            throw new Error(
                "No Reels found on your profile."
            );
        }

        console.log(
            `Found ${reels.length} Reel(s).`
        );


        // ==================================================
        // 3. OPEN LATEST REEL
        // ==================================================

        const reelUrl = reels[0];

        console.log(
            "Opening latest Reel:",
            reelUrl
        );

        await page.goto(
            reelUrl,
            {
                waitUntil: "domcontentloaded"
            }
        );

        await page.waitForTimeout(5000);


        // ==================================================
        // 3.5 GET INSTAGRAM MUSIC INFORMATION
        // ==================================================

        console.log("");
        console.log("Finding Instagram music information...");

        const musicInfo = await page.evaluate(() => {

            const text = document.body.innerText || "";

            // Look for Instagram's music/audio link
            const links = Array.from(document.querySelectorAll("a"));

            const musicLink = links.find(a => {
                const href = a.href || "";

                return (
                    href.includes("/music/") ||
                    href.includes("/audio/")
                );
            });

            let musicText = "";

            if (musicLink) {
                musicText = musicLink.innerText.trim();
            }

            return {
                musicText,
                musicUrl: musicLink ? musicLink.href : null,
                pageText: text
            };
        });

        console.log("Instagram music information:");
        console.log({
            musicText: musicInfo.musicText,
            musicUrl: musicInfo.musicUrl
        });


        // ==================================================
        // 4. FIND VIDEO
        // ==================================================

        const video = page.locator("video").first();

        try {
            await video.waitFor({
                state: "attached",
                timeout: 20000
            });
        } catch (error) {
            throw new Error(
                "Instagram video element was not found within 20 seconds."
            );
        }

        console.log("Video element found.");


        // ==================================================
        // 5. GET VIDEO INFORMATION
        // ==================================================

        const videoInfo = await video.evaluate(
            element => ({
                src: element.src,
                currentSrc: element.currentSrc,
                duration: element.duration,
                width: element.videoWidth,
                height: element.videoHeight,
                paused: element.paused,
                readyState: element.readyState
            })
        );

        console.log("Video information:");
        console.log(videoInfo);


        if (!videoInfo.duration || videoInfo.duration <= 0) {

            throw new Error(
                "Video duration could not be determined."
            );

        }


        // ==================================================
        // 6. START BROWSER-SIDE CAPTURE
        // ==================================================

        console.log("");
        console.log(
            "Capturing the Reel directly from Chrome..."
        );

        console.log(
            `Duration: ${videoInfo.duration.toFixed(2)} seconds`
        );


        const recordedBase64 = await page.evaluate(
            async () => {

                const video =
                    document.querySelector("video");

                if (!video) {
                    throw new Error(
                        "Video element disappeared."
                    );
                }


                // ------------------------------------------------
                // Make sure the video is ready
                // ------------------------------------------------

                video.muted = false;
                video.volume = 1;


                // ------------------------------------------------
                // Find captureStream support
                // ------------------------------------------------

                const captureFunction =
                    video.captureStream ||
                    video.mozCaptureStream;

                if (!captureFunction) {

                    throw new Error(
                        "Chrome does not support captureStream()."
                    );

                }


                // ------------------------------------------------
                // Move video to beginning
                // ------------------------------------------------

                try {
                    video.currentTime = 0;
                } catch (_) {}


                // ------------------------------------------------
                // Start playback
                // ------------------------------------------------

                try {

                    await video.play();

                } catch (error) {

                    console.log(
                        "Normal video.play() failed. Trying click..."
                    );

                    video.click();

                    await new Promise(
                        resolve => setTimeout(resolve, 1000)
                    );

                    await video.play();

                }


                // ------------------------------------------------
                // Wait until actually playing
                // ------------------------------------------------

                await new Promise(
                    (resolve, reject) => {

                        const timeout =
                            setTimeout(
                                () => reject(
                                    new Error(
                                        "Video did not start playing."
                                    )
                                ),
                                10000
                            );

                        if (
                            !video.paused &&
                            video.readyState >= 2
                        ) {

                            clearTimeout(timeout);
                            resolve();

                            return;

                        }

                        video.addEventListener(
                            "playing",
                            () => {

                                clearTimeout(timeout);
                                resolve();

                            },
                            {
                                once: true
                            }
                        );

                    }
                );


                // ------------------------------------------------
                // Capture the actual rendered media
                // ------------------------------------------------

                const stream =
                    captureFunction.call(video);


                if (!stream) {

                    throw new Error(
                        "captureStream() returned nothing."
                    );

                }


                const tracks =
                    stream.getTracks();

                if (!tracks.length) {

                    throw new Error(
                        "captureStream() returned no tracks."
                    );

                }


                // ------------------------------------------------
                // Determine supported recording format
                // ------------------------------------------------

                const formats = [
                    "video/webm;codecs=vp9,opus",
                    "video/webm;codecs=vp8,opus",
                    "video/webm"
                ];

                let mimeType = null;

                for (const format of formats) {

                    if (
                        MediaRecorder.isTypeSupported(format)
                    ) {

                        mimeType = format;
                        break;

                    }

                }


                if (!mimeType) {

                    throw new Error(
                        "No supported MediaRecorder format found."
                    );

                }


                console.log(
                    `Recording using ${mimeType}`
                );


                // ------------------------------------------------
                // Create recorder
                // ------------------------------------------------

                const recorder =
                    new MediaRecorder(
                        stream,
                        {
                            mimeType
                        }
                    );


                const chunks = [];


                recorder.ondataavailable =
                    event => {

                        if (
                            event.data &&
                            event.data.size > 0
                        ) {

                            chunks.push(event.data);

                        }

                    };


                // ------------------------------------------------
                // Wait until video ends
                // ------------------------------------------------

                const recordingFinished =
                    new Promise(
                        (resolve, reject) => {

                            recorder.onstop =
                                resolve;

                            recorder.onerror =
                                event =>
                                    reject(
                                        event.error ||
                                        new Error(
                                            "MediaRecorder error"
                                        )
                                    );

                        }
                    );


                recorder.start(1000);


                // ------------------------------------------------
                // Wait for actual Reel to finish
                // ------------------------------------------------

                await new Promise(
                    (resolve, reject) => {

                        const timeout =
                            setTimeout(
                                () => {

                                    if (
                                        !video.ended
                                    ) {

                                        try {
                                            video.pause();
                                        } catch (_) {}

                                    }

                                    resolve();

                                },
                                (video.duration + 3) * 1000
                            );


                        video.addEventListener(
                            "ended",
                            () => {

                                clearTimeout(timeout);
                                resolve();

                            },
                            {
                                once: true
                            }
                        );

                    }
                );


                // ------------------------------------------------
                // Stop recording
                // ------------------------------------------------

                if (
                    recorder.state !== "inactive"
                ) {

                    recorder.stop();

                }


                await recordingFinished;


                // ------------------------------------------------
                // Combine chunks
                // ------------------------------------------------

                const blob =
                    new Blob(
                        chunks,
                        {
                            type: mimeType
                        }
                    );


                const buffer =
                    await blob.arrayBuffer();


                const bytes =
                    new Uint8Array(buffer);


                // Convert to base64 in chunks
                let binary = "";

                const chunkSize = 0x8000;

                for (
                    let i = 0;
                    i < bytes.length;
                    i += chunkSize
                ) {

                    const chunk =
                        bytes.subarray(
                            i,
                            Math.min(
                                i + chunkSize,
                                bytes.length
                            )
                        );

                    binary += String.fromCharCode(
                        ...chunk
                    );

                }


                return {
                    base64: btoa(binary),
                    mimeType,
                    size: bytes.length
                };

            }
        );


        // ==================================================
        // 7. SAVE WEBM
        // ==================================================

        console.log("");
        console.log(
            "Recording captured successfully."
        );

        const webmBuffer =
            Buffer.from(
                recordedBase64.base64,
                "base64"
            );


        const mediaDirectory =
            path.resolve("media");

        if (!fs.existsSync(mediaDirectory)) {

            fs.mkdirSync(
                mediaDirectory,
                {
                    recursive: true
                }
            );

        }


        const timestamp =
            Date.now();

        const webmPath =
            path.join(
                mediaDirectory,
                `reel_${timestamp}.webm`
            );


        fs.writeFileSync(
            webmPath,
            webmBuffer
        );


        console.log(
            "WebM saved:",
            webmPath
        );


        // ==================================================
        // 8. CONVERT WEBM -> MP4 USING FFMPEG
        // ==================================================

        console.log("");
        console.log(
            "Converting WebM to MP4..."
        );


        const { execFile } =
            require("child_process");

        const util =
            require("util");

        const execFileAsync =
            util.promisify(execFile);


        const mp4Path =
            path.join(
                mediaDirectory,
                `reel_${timestamp}.mp4`
            );


        await execFileAsync(
            "ffmpeg",
            [
                "-y",
                "-i",
                webmPath,

                "-c:v",
                "libx264",

                "-preset",
                "medium",

                "-crf",
                "18",

                "-c:a",
                "aac",

                "-b:a",
                "192k",

                "-movflags",
                "+faststart",

                mp4Path
            ],
            {
                windowsHide: true
            }
        );


        // ==================================================
        // 9. VERIFY MP4
        // ==================================================

        if (!fs.existsSync(mp4Path)) {

            throw new Error(
                "FFmpeg did not create the MP4."
            );

        }


        const fileSize =
            fs.statSync(mp4Path).size;


        console.log("");
        console.log("==============================");
        console.log("VIDEO SAVED SUCCESSFULLY");
        console.log("==============================");

        console.log(
            "Reel:",
            reelUrl
        );

        console.log(
            "File:",
            mp4Path
        );

        console.log(
            "Size:",
            `${(fileSize / 1024 / 1024).toFixed(2)} MB`
        );

        console.log(
            "Resolution:",
            `${videoInfo.width}x${videoInfo.height}`
        );

        console.log(
            "Duration:",
            `${videoInfo.duration.toFixed(2)} seconds`
        );

        console.log("==============================");
        console.log("");


        // ==================================================
        // 10. JSON FOR n8n
        // ==================================================

        console.log(
             JSON.stringify({
        success: true,
        reel_url: reelUrl,
        media_path: mp4Path,
        file_size: fileSize,
        video_width: videoInfo.width,
        video_height: videoInfo.height,
        duration: videoInfo.duration,
        music_text: musicInfo.musicText || null,
        music_url: musicInfo.musicUrl || null
    })
);

    } catch (error) {

        console.error("");
        console.error("==============================");
        console.error("DOWNLOAD FAILED");
        console.error("==============================");
        console.error(error);
        console.error("==============================");

        process.exitCode = 1;

    } finally {

        await browser.close();

    }

})();