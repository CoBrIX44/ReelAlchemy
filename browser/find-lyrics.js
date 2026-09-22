const { chromium } = require("playwright");

const artist = process.argv[2];
const title = process.argv[3];

if (!artist || !title) {
    console.error('Usage: find-lyrics.js "artist" "title"');
    process.exit(1);
}


// ============================================================
// HELPERS
// ============================================================

function normalize(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function titleVariants() {

    const original = title.trim();

    const variants = [
        original,

        // Common Tamil transliteration variation
        original.replace(/ile$/i, "ilae"),
        original.replace(/ilae$/i, "ile")
    ];

    const words = original.split(/\s+/).filter(Boolean);

    // ------------------------------------------------------------
    // Handle Instagram titles that contain extra repeated phrases.
    //
    // Example:
    // "Edhu Sugam Sugam Adhu Veendum Veendum"
    //
    // Tamil2Lyrics:
    // "Edhu Sugam Sugam"
    // ------------------------------------------------------------

    if (words.length >= 5) {

        // Remove common trailing phrase:
        // "adhu veendum veendum"
        const withoutAdhuVeendum =
            original.replace(
                /\s+adhu\s+veendum\s+veendum$/i,
                ""
            ).trim();

        if (withoutAdhuVeendum) {
            variants.push(withoutAdhuVeendum);
        }

        // Remove a repeated final word pair.
        // Example:
        // "veendum veendum" -> remove both
        const shortened =
            words.slice(0, -2).join(" ").trim();

        if (shortened && shortened.split(/\s+/).length >= 3) {
            variants.push(shortened);
        }
    }

    return [
        ...new Set(
            variants
                .map(v => v.trim())
                .filter(Boolean)
        )
    ];
}

function titleMatches(text) {

    const normalized =
        normalize(text);

    for (
        const variant
        of titleVariants()
    ) {

        const words =
            normalize(variant)
                .split(/\s+/)
                .filter(
                    word =>
                        word.length >= 3
                );


        if (
            words.length === 0
        ) {
            continue;
        }


        const matches =
            words.filter(
                word =>
                    normalized.includes(word)
            ).length;


        // Require every significant title word.
        if (
            matches === words.length
        ) {
            return true;
        }
    }


    return false;
}


function lyricPageLooksValid(
    text,
    url,
    pageTitle
) {

    const combined =
        normalize(
            `${text} ${url} ${pageTitle}`
        );


    const indicators = [

        "lyrics",
        "lyric",
        "singers",
        "singer",
        "music by",
        "music director",
        "lyricist",
        "tamil lyrics",
        "song lyrics",
        "பாடல்",
        "பாடல்வரிகள்"

    ];


    let count = 0;


    for (
        const indicator
        of indicators
    ) {

        if (
            combined.includes(
                normalize(indicator)
            )
        ) {

            count++;
        }
    }


    return count >= 2;
}


// ============================================================
// SEARCH TAMIL2LYRICS
// ============================================================

async function searchSite(
    page,
    query
) {

    const url =
        "https://www.tamil2lyrics.com/?s=" +
        encodeURIComponent(query);


    console.log("");
    console.log(
        `Tamil2Lyrics search: ${query}`
    );


    await page.goto(
        url,
        {
            waitUntil:
                "domcontentloaded",

            timeout: 30000
        }
    );


    await page.waitForTimeout(
        1200
    );


    console.log(
        `Search page: ${page.url()}`
    );


    // --------------------------------------------------------
    // Collect links from the actual search results page.
    // --------------------------------------------------------

    const links =
        await page
            .locator("a[href]")
            .evaluateAll(
                anchors =>
                    anchors.map(
                        a => ({

                            text:
                                (
                                    a.innerText ||
                                    a.textContent ||
                                    ""
                                ).trim(),

                            href:
                                a.href ||
                                ""

                        })
                    )
            );


    const candidates =
        links
            .filter(
                item =>
                    item.text &&
                    item.href &&
                    item.href.startsWith(
                        "https://www.tamil2lyrics.com/"
                    )
            )
            .filter(
                item =>
                    titleMatches(
                        item.text
                    )
            );


    // Remove duplicate URLs.

    const unique =
        [];

    const seen =
        new Set();


    for (
        const candidate
        of candidates
    ) {

        const key =
            candidate.href
                .split("#")[0];


        if (
            seen.has(key)
        ) {
            continue;
        }


        seen.add(key);

        unique.push(candidate);
    }


    console.log(
        `Matching site results: ${unique.length}`
    );


    for (
        const candidate
        of unique
    ) {

        console.log(
            `  ${candidate.text}`
        );

        console.log(
            `  ${candidate.href}`
        );
    }


    return unique;
}


// ============================================================
// OPEN AND VERIFY LYRIC PAGE
// ============================================================

async function verifyCandidate(
    context,
    candidate
) {

    console.log("");
    console.log(
        `Opening lyric candidate:`
    );

    console.log(
        candidate.href
    );


    const page =
        await context.newPage();


    try {

        await page.goto(
            candidate.href,
            {
                waitUntil:
                    "domcontentloaded",

                timeout: 30000
            }
        );


        await page.waitForTimeout(
            1000
        );


        const finalUrl =
            page.url();


        const pageTitle =
            await page.title();


        const bodyText =
            await page
                .locator("body")
                .innerText();


        console.log(
            `Page title: ${pageTitle}`
        );


        console.log(
            `Page text length: ${bodyText.length}`
        );


        // ----------------------------------------------------
        // Verify title.
        // ----------------------------------------------------

        if (
            !titleMatches(
                `${pageTitle} ${bodyText.slice(0, 8000)}`
            )
        ) {

            console.log(
                "Rejected: song title does not match."
            );

            return null;
        }


        // ----------------------------------------------------
        // Verify lyric page.
        // ----------------------------------------------------

        if (
            !lyricPageLooksValid(
                bodyText,
                finalUrl,
                pageTitle
            )
        ) {

            console.log(
                "Rejected: page does not look like lyrics."
            );

            return null;
        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        console.log("");
        console.log(
            "SUCCESS: lyric page found."
        );


        return {

            success: true,

            artist,

            title,

            url: finalUrl,

            text: bodyText

        };


    } catch (error) {

        console.log(
            `Candidate failed: ${error.message}`
        );

        return null;


    } finally {

        await page.close()
            .catch(() => {});
    }
}


// ============================================================
// MAIN
// ============================================================

(async () => {

    const browser =
        await chromium.launch({
            headless: true
        });


    const context =
        await browser.newContext({

            viewport: {
                width: 1440,
                height: 900
            },

            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36"

        });


    const page =
        await context.newPage();


    try {

        let candidates = [];


        // ----------------------------------------------------
        // Search title variants.
        // ----------------------------------------------------

        for (
            const query
            of titleVariants()
        ) {

            const results =
                await searchSite(
                    page,
                    query
                );


            candidates.push(
                ...results
            );
        }


        // ----------------------------------------------------
        // Remove duplicates.
        // ----------------------------------------------------

        const seen =
            new Set();


        candidates =
            candidates.filter(
                candidate => {

                    const key =
                        candidate.href
                            .split("#")[0];


                    if (
                        seen.has(key)
                    ) {

                        return false;
                    }


                    seen.add(key);

                    return true;
                }
            );


        console.log("");
        console.log(
            `Total unique lyric candidates: ${candidates.length}`
        );


        // ----------------------------------------------------
        // Verify candidates.
        // ----------------------------------------------------

        for (
            const candidate
            of candidates
        ) {

            const result =
                await verifyCandidate(
                    context,
                    candidate
                );


            if (result) {

                console.log(
                    JSON.stringify(
                        result
                    )
                );

                return;
            }
        }


        // ----------------------------------------------------
        // Nothing found.
        // ----------------------------------------------------

        console.log(
            JSON.stringify({

                success: false,

                error:
                    "Tamil2Lyrics search returned no verified lyric page.",

                artist,

                title

            })
        );


    } catch (error) {

        console.log(
            JSON.stringify({

                success: false,

                error:
                    error.message,

                artist,

                title

            })
        );


    } finally {

        await page.close()
            .catch(() => {});

        await browser.close();
    }

})();