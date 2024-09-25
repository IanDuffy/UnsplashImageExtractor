// content.js

/**
 * Extracts image data from the Unsplash gallery.
 * - imageUrl: Direct link to the image page.
 * - thumbnailUrl: URL of the thumbnail image with 30w size.
 */
function extractImageData() {
    const figures = document.querySelectorAll('figure');
    const images = Array.from(figures).slice(0, 20).map(figure => {
        // Select the <a> tag with itemprop="contentUrl" within the figure
        const anchor = figure.querySelector('a[itemprop="contentUrl"]');
        if (!anchor) return null;

        // Select the <img> tag with itemprop="thumbnailUrl" within the <a> tag
        const img = anchor.querySelector('img[itemprop="thumbnailUrl"]');
        if (!img) return null;

        // Extract the title from the <a> tag's title attribute
        const title = anchor.getAttribute('title') || 'Untitled';

        // Extract the relative href and construct the full imageUrl
        const imageUrlRelative = anchor.getAttribute('href') || '';
        const imageUrl = imageUrlRelative.startsWith('http')
            ? imageUrlRelative
            : `https://unsplash.com${imageUrlRelative}`;

        // Extract the srcset attribute
        const srcset = img.getAttribute('srcset') || '';
        let thumbnailUrl = '';

        // Function to extract the URL corresponding to 30w
        const getThumbnailUrl = (srcset) => {
            // Split the srcset into individual sources
            const sources = srcset.split(',');

            // Iterate through each source to find the one with '30w'
            for (let source of sources) {
                const [url, descriptor] = source.trim().split(' ');
                if (descriptor === '30w') {
                    return url;
                }
            }

            // If '30w' is not found, return null or handle accordingly
            return null;
        };

        thumbnailUrl = getThumbnailUrl(srcset);

        // If '30w' URL is not found, you can choose to skip or handle it
        if (!thumbnailUrl) {
            console.warn(`30w thumbnail not found for image: ${imageUrl}`);
            return null; // Skip this image or handle as needed
        }

        // Debugging Logs
        console.log(`Title: ${title}`);
        console.log(`Image URL: ${imageUrl}`);
        console.log(`Thumbnail URL: ${thumbnailUrl}`);

        return {
            title: title,
            imageUrl: imageUrl,
            thumbnailUrl: thumbnailUrl
        };
    }).filter(Boolean); // Remove any null entries

    const data = {
        url: window.location.href,
        images: images
    };

    console.log("Sending data to background script:", data);

    chrome.runtime.sendMessage({action: "sendDataToFlask", data: data}, function(response) {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
        } else {
            console.log('Message sent successfully');
        }
    });
}

/**
 * Waits for the images to load in the DOM before extracting data.
 */
function waitForImages() {
    return new Promise((resolve) => {
        const checkImages = () => {
            // Check for <img> tags with itemprop="thumbnailUrl" within <a> tags inside <figure>
            const images = document.querySelectorAll('figure a[itemprop="contentUrl"] img[itemprop="thumbnailUrl"]');
            if (images.length > 0) {
                resolve();
            } else {
                setTimeout(checkImages, 100); // Retry after 100ms
            }
        };
        checkImages();
    });
}

/**
 * Initializes the data extraction process.
 */
async function init() {
    await waitForImages();
    extractImageData();
}

init();