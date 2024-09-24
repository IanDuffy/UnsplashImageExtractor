// content.js

function extractImageData() {
    const figures = document.querySelectorAll('figure');
    const images = Array.from(figures).slice(0, 20).map(figure => {
        const anchor = figure.querySelector('a');
        if (!anchor) return null;

        // Select the first <img> with 'sizes' attribute within the <a> tag
        const img = anchor.querySelector('img[sizes]');
        if (!img) return null;

        const title = anchor.getAttribute('title') || 'Untitled';
        const imageUrl = anchor.href || '';

        const srcset = img.getAttribute('srcset') || '';

        // Function to extract the base URL and append 'w=300'
        const getThumbnailUrl = (srcset) => {
            if (!srcset) return img.src; // Fallback to img.src if srcset is empty

            // Split the srcset into individual sources
            const sources = srcset.split(',');

            // Extract the first URL from srcset
            const firstSource = sources[0].trim();
            const firstUrl = firstSource.split(' ')[0];

            try {
                const urlObj = new URL(firstUrl);
                // Append or update the 'w' query parameter to 300
                urlObj.searchParams.set('w', '300');
                return urlObj.toString();
            } catch (error) {
                console.error('Invalid URL:', firstUrl);
                return firstUrl; // Fallback to the original URL if invalid
            }
        };

        const thumbnailUrl = getThumbnailUrl(srcset);

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

function waitForImages() {
    return new Promise((resolve) => {
        const checkImages = () => {
            const images = document.querySelectorAll('figure img[sizes]');
            if (images.length > 0) {
                resolve();
            } else {
                setTimeout(checkImages, 100); // Retry after 100ms
            }
        };
        checkImages();
    });
}

async function init() {
    await waitForImages();
    extractImageData();
}

init();
