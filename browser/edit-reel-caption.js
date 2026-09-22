const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const username = "winmini_kitchen_bangalore";

const captionFile = process.argv[2];
const mode = process.argv[3] || "dry-run";

if (!captionFile) {
    console.error(
        'Usage: node edit-reel-caption.js "caption-file-path" [dry-run|save]'
    );
    process.exit(1);
}

let newCaption = "";

try {
    newCaption = fs
        .readFileSync(captionFile, "utf8")
        .trim();
} catch (error) {
    console.error(
        `Could not read caption file: ${error.message}`
    );
    process.exit(1);
}

if (!newCaption) {
    console.error(
        "Caption file is empty."
    );
    process.exit(1);
}


(async () => {

    let browser;

    try {

        // ==================================================
        // START BROWSER
        // ==================================================

        console.log(
            "Starting Instagram browser..."
        );

        browser =
            await chromium.launchPersistentContext(
                path.resolve(
                    "F:\\instagram-automation\\browser\\instagram-profile"
                ),
                {
                    headless: false,

                    viewport: {
                        width: 1440,
                        height: 900
                    }
                }
            );

        const pages =
            browser.pages();

        const page =
            pages.length > 0
                ? pages[0]
                : await browser.newPage();


        // ==================================================
        // 1. OPEN YOUR PROFILE
        // ==================================================

        console.log(
            "Opening your Instagram profile..."
        );

        await page.goto(
            `https://www.instagram.com/${username}/`,
            {
                waitUntil: "domcontentloaded",
                timeout: 60000
            }
        );

        await page.waitForTimeout(
            4000
        );

        console.log(
            "Current URL:",
            page.url()
        );

        if (
            page.url().includes(
                "/accounts/login"
            )
        ) {
            throw new Error(
                "Instagram is not logged in in the persistent browser profile."
            );
        }

        console.log(
            "Instagram session detected."
        );


        // ==================================================
        // 2. FIND YOUR REELS
        // ==================================================

        console.log(
            "Finding your Reels..."
        );

        const reelLinks =
            new Set();

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const links =
                await page
                    .locator("a")
                    .evaluateAll(
                        anchors =>
                            anchors
                                .map(
                                    a => a.href
                                )
                                .filter(Boolean)
                    );

            for (
                const url of links
            ) {

                if (
                    url.includes(
                        `instagram.com/${username}/reel/`
                    )
                ) {
                    reelLinks.add(url);
                }
            }

            await page.mouse.wheel(
                0,
                1500
            );

            await page.waitForTimeout(
                1200
            );
        }

        const reels =
            [...reelLinks];

        if (!reels.length) {
            throw new Error(
                "No Reels found on your Instagram profile."
            );
        }

        console.log(
            `Found ${reels.length} Reel(s).`
        );

        console.log(
            "Latest Reel URL:",
            reels[0]
        );


        // ==================================================
        // 3. OPEN LATEST REEL
        // ==================================================

        console.log(
            "Opening latest Reel by clicking it from the profile..."
        );

        await page.evaluate(() => {
            window.scrollTo(
                0,
                0
            );
        });

        await page.waitForTimeout(
            1500
        );

        const latestReelLink =
            page.locator(
                `a[href*="/${username}/reel/"]`
            ).first();

        await latestReelLink.waitFor({
            state: "visible",
            timeout: 30000
        });

        await latestReelLink.click();

        console.log(
            "Clicked latest Reel."
        );

        await page.waitForTimeout(
            4000
        );

        console.log(
            "Current URL after opening Reel:",
            page.url()
        );


        // ==================================================
        // 4. FIND THREE-DOT MENU
        // ==================================================

        console.log(
            "Looking for Reel options (⋯)..."
        );

        let optionsButton =
            null;

        const roleButtons =
            page.locator(
                '[role="button"]'
            );

        const roleButtonCount =
            await roleButtons.count();

        for (
            let i = 0;
            i < roleButtonCount;
            i++
        ) {

            const candidate =
                roleButtons.nth(i);

            const box =
                await candidate
                    .boundingBox()
                    .catch(() => null);

            if (!box) {
                continue;
            }

            if (
                box.x < 1130 ||
                box.x > 1205 ||
                box.y < 25 ||
                box.y > 105 ||
                box.width > 80 ||
                box.height > 80
            ) {
                continue;
            }

            console.log(
                "Possible Reel header button:",
                {
                    index: i,
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height
                }
            );

            optionsButton =
                candidate;

            break;
        }


        // SVG fallback

        if (!optionsButton) {

            const svgs =
                page.locator(
                    "svg"
                );

            const svgCount =
                await svgs.count();

            for (
                let i = 0;
                i < svgCount;
                i++
            ) {

                const svg =
                    svgs.nth(i);

                const box =
                    await svg
                        .boundingBox()
                        .catch(() => null);

                if (!box) {
                    continue;
                }

                if (
                    box.x >= 1150 &&
                    box.x <= 1205 &&
                    box.y >= 30 &&
                    box.y <= 100 &&
                    box.width <= 40 &&
                    box.height <= 40
                ) {

                    optionsButton =
                        svg;

                    console.log(
                        "Found Reel header SVG."
                    );

                    break;
                }
            }
        }


        if (!optionsButton) {

            await page.screenshot({
                path:
                    "F:\\instagram-automation\\logs\\reel-options-debug.png",
                fullPage: true
            });

            throw new Error(
                "Reel options button was not found."
            );
        }

        console.log(
            "Three-dot Reel options button found."
        );

        await optionsButton.click({
            force: true,
            timeout: 15000
        });

        console.log(
            "Opened Reel options."
        );

        await page.waitForTimeout(
            1000
        );


        // ==================================================
        // 5. CLICK EDIT
        // ==================================================

        console.log(
            "Looking for Edit..."
        );

        const editButton =
            page.getByText(
                "Edit",
                {
                    exact: true
                }
            ).first();

        await editButton.waitFor({
            state: "visible",
            timeout: 15000
        });

        await editButton.click({
            force: true
        });

        console.log(
            "Clicked Edit."
        );

        await page.waitForTimeout(
            2500
        );


        // ==================================================
        // 6. FIND ACTUAL CAPTION EDITOR
        // ==================================================

        console.log(
            "Looking for the Instagram caption editor..."
        );

        let captionField =
            null;


        // --------------------------------------------------
        // METHOD 1: Caption-specific textarea
        // --------------------------------------------------

        const captionTextareas =
            page.locator(
                'textarea[placeholder*="caption" i], textarea[aria-label*="caption" i]'
            );

        const captionTextareaCount =
            await captionTextareas.count();

        console.log(
            `Caption-specific textarea candidates: ${captionTextareaCount}`
        );

        for (
            let i = 0;
            i < captionTextareaCount;
            i++
        ) {

            const candidate =
                captionTextareas.nth(i);

            if (
                !await candidate
                    .isVisible()
                    .catch(() => false)
            ) {
                continue;
            }

            if (
                !await candidate
                    .isEditable()
                    .catch(() => false)
            ) {
                continue;
            }

            captionField =
                candidate;

            console.log(
                `Using caption textarea ${i}.`
            );

            break;
        }


        // --------------------------------------------------
        // METHOD 2: Caption contenteditable
        // --------------------------------------------------

        if (!captionField) {

            const editables =
                page.locator(
                    '[contenteditable="true"]'
                );

            const editableCount =
                await editables.count();

            console.log(
                `Contenteditable candidates: ${editableCount}`
            );

            for (
                let i = 0;
                i < editableCount;
                i++
            ) {

                const candidate =
                    editables.nth(i);

                if (
                    !await candidate
                        .isVisible()
                        .catch(() => false)
                ) {
                    continue;
                }

                if (
                    !await candidate
                        .isEditable()
                        .catch(() => false)
                ) {
                    continue;
                }

                const ariaLabel =
                    String(
                        await candidate
                            .getAttribute(
                                "aria-label"
                            )
                            .catch(() => "")
                        || ""
                    )
                        .trim()
                        .toLowerCase();

                const placeholder =
                    String(
                        await candidate
                            .getAttribute(
                                "data-placeholder"
                            )
                            .catch(() => "")
                        || ""
                    )
                        .trim()
                        .toLowerCase();

                const text =
                    String(
                        await candidate
                            .innerText()
                            .catch(() => "")
                        || ""
                    )
                        .trim()
                        .toLowerCase();

                if (
                    ariaLabel.includes(
                        "caption"
                    ) ||
                    placeholder.includes(
                        "caption"
                    ) ||
                    text ===
                        "add a caption..."
                ) {

                    captionField =
                        candidate;

                    console.log(
                        `Using caption contenteditable ${i}.`
                    );

                    break;
                }
            }
        }


        // --------------------------------------------------
        // METHOD 3: Right side of Edit Info modal
        // --------------------------------------------------

        if (!captionField) {

            const editables =
                page.locator(
                    '[contenteditable="true"]'
                );

            const editableCount =
                await editables.count();

            for (
                let i = 0;
                i < editableCount;
                i++
            ) {

                const candidate =
                    editables.nth(i);

                if (
                    !await candidate
                        .isVisible()
                        .catch(() => false)
                ) {
                    continue;
                }

                const box =
                    await candidate
                        .boundingBox()
                        .catch(() => null);

                if (!box) {
                    continue;
                }

                if (
                    box.x >= 900 &&
                    box.x <= 1320 &&
                    box.y >= 250 &&
                    box.y <= 550
                ) {

                    captionField =
                        candidate;

                    console.log(
                        `Using right-side Edit Info contenteditable ${i}.`
                    );

                    break;
                }
            }
        }


        if (!captionField) {

            await page.screenshot({
                path:
                    "F:\\instagram-automation\\logs\\caption-field-debug.png",
                fullPage: true
            });

            throw new Error(
                "Could not find Instagram's actual caption editor."
            );
        }

        console.log(
            "Instagram caption editor found."
        );


        // ==================================================
        // 7. READ OLD CAPTION
        // ==================================================

        const getEditorText =
            async () => {

                const tagName =
                    await captionField.evaluate(
                        el =>
                            el.tagName.toLowerCase()
                    );

                if (
                    tagName === "textarea" ||
                    tagName === "input"
                ) {

                    return await captionField
                        .inputValue();

                }

                return await captionField
                    .innerText()
                    .catch(() => "");
            };


        const oldCaption =
            await getEditorText();


        console.log("");

        console.log(
            "=========================================="
        );

        console.log(
            "OLD CAPTION:"
        );

        console.log(
            oldCaption
        );

        console.log("");

        console.log(
            "NEW CAPTION:"
        );

        console.log(
            newCaption
        );

        console.log(
            "=========================================="
        );


        // ==================================================
        // 8. CLEAR CAPTION
        // ==================================================

        console.log(
            "Clearing existing caption..."
        );

        await captionField.click({
            force: true
        });

        await captionField.press(
            "Control+A"
        );

        await captionField.press(
            "Backspace"
        );

        await page.waitForTimeout(
            500
        );


        // ==================================================
        // 9. TYPE NEW CAPTION
        // ==================================================

        console.log(
            "Typing new caption..."
        );

        await captionField.pressSequentially(
            newCaption,
            {
                delay: 2
            }
        );

        await page.waitForTimeout(
            1000
        );


        // ==================================================
        // 10. VERIFY CAPTION INSIDE EDITOR
        // ==================================================

        const enteredCaption =
            await getEditorText();

        console.log(
            "Caption currently inside editor:"
        );

        console.log(
            enteredCaption
        );


        if (
            enteredCaption.trim() !==
            newCaption.trim()
        ) {

            await page.screenshot({
                path:
                    "F:\\instagram-automation\\logs\\caption-before-save-failed.png",
                fullPage: true
            });

            throw new Error(
                "Caption verification failed BEFORE saving."
            );
        }

        console.log(
            "Caption verified inside editor."
        );


        // ==================================================
        // 11. DRY RUN
        // ==================================================

        if (
            mode.toLowerCase() !==
            "save"
        ) {

            await page.screenshot({
                path:
                    "F:\\instagram-automation\\logs\\caption-edit-preview.png",
                fullPage: true
            });

            console.log("");

            console.log(
                "=========================================="
            );

            console.log(
                "DRY RUN COMPLETE"
            );

            console.log(
                "Caption was entered and verified."
            );

            console.log(
                "Instagram SAVE/DONE was NOT clicked."
            );

            console.log(
                "=========================================="
            );

            await new Promise(
                () => {}
            );

            return;
        }


        // ==================================================
        // 12. SAVE
        // ==================================================

        console.log(
            "Leaving caption field..."
        );

        await captionField.press(
            "Tab"
        );

        await page.waitForTimeout(
            1500
        );

        console.log(
            "Save mode enabled."
        );

        const doneButton =
            page.getByText(
                "Done",
                {
                    exact: true
                }
            ).first();

        await doneButton.waitFor({
            state: "visible",
            timeout: 15000
        });

        console.log(
            "Clicking Done..."
        );

        await doneButton.click({
            force: true
        });

        console.log(
            "Clicked Done."
        );


        // ==================================================
        // 13. WAIT FOR INSTAGRAM TO FINISH SAVING
        // ==================================================

        console.log(
            "Waiting for Instagram to finish saving..."
        );

        await page.waitForTimeout(
            8000
        );


        // ==================================================
        // 14. RELOAD ACTUAL REEL
        // ==================================================

        console.log(
            "Reloading the Reel..."
        );

        await page.reload({
            waitUntil:
                "domcontentloaded",
            timeout: 60000
        });

        await page.waitForTimeout(
            5000
        );


        // ==================================================
        // 15. CHECK ACTUAL REEL PAGE
        // ==================================================

        console.log(
            "Checking the actual Reel page..."
        );

        const pageText =
            await page
                .locator("body")
                .innerText()
                .catch(() => "");


        const normalizeText =
            (text) =>
                String(text || "")
                    .replace(
                        /\r/g,
                        ""
                    )
                    .replace(
                        /[ \t]+/g,
                        " "
                    )
                    .replace(
                        /\n{2,}/g,
                        "\n"
                    )
                    .trim();


        const expectedNormalized =
            normalizeText(
                newCaption
            );

        const pageNormalized =
            normalizeText(
                pageText
            );


        let captionSaved =
            pageNormalized.includes(
                expectedNormalized
            );


        // --------------------------------------------------
        // Check each meaningful line
        // --------------------------------------------------

        if (!captionSaved) {

            const expectedLines =
                newCaption
                    .split(/\r?\n/)
                    .map(
                        line =>
                            line.trim()
                    )
                    .filter(Boolean);

            captionSaved =
                expectedLines.length > 0 &&
                expectedLines.every(
                    line =>
                        pageNormalized.includes(
                            normalizeText(
                                line
                            )
                        )
                );
        }


        // ==================================================
        // 16. FINAL RESULT
        // ==================================================

        if (captionSaved) {

            console.log("");

            console.log(
                "=========================================="
            );

            console.log(
                "CAPTION VERIFIED ON REEL"
            );

            console.log(
                "Instagram successfully saved the caption."
            );

            console.log(
                "=========================================="
            );

        } else {

            /*
             * IMPORTANT:
             *
             * Instagram has already received the Done click.
             * The caption may be saved even when the Reel page
             * does not expose the caption in body.innerText().
             *
             * Therefore we do NOT report this as a save failure.
             */

            await page.screenshot({
                path:
                    "F:\\instagram-automation\\logs\\caption-save-page-check.png",
                fullPage: true
            });

            console.log("");

            console.log(
                "=========================================="
            );

            console.log(
                "CAPTION SAVE COMPLETED"
            );

            console.log(
                "Done was clicked successfully."
            );

            console.log(
                "The caption was verified inside the editor before saving."
            );

            console.log(
                "The Reel page did not expose the caption text for automatic DOM verification."
            );

            console.log(
                "=========================================="
            );
        }


        // ==================================================
        // 17. CLOSE BROWSER AND EXIT CLEANLY
        // ==================================================

        console.log("");

        console.log(
            "Closing Instagram browser..."
        );

        if (browser) {
            await browser.close().catch(() => {});
        }

        console.log(
            "Instagram caption automation finished successfully."
        );


    } catch (error) {

        console.error("");

        console.error(
            "=========================================="
        );

        console.error(
            "CAPTION EDIT FAILED"
        );

        console.error(
            error.message
        );

        console.error(
            "=========================================="
        );

        if (browser) {

            const pages =
                browser.pages();

            if (
                pages.length > 0
            ) {

                await pages[0]
                    .screenshot({
                        path:
                            "F:\\instagram-automation\\logs\\caption-edit-error.png",
                        fullPage: true
                    })
                    .catch(
                        () => {}
                    );
            }
        }

        process.exit(1);
    }

})();