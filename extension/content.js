function extractImageData() {
    const figures = document.querySelectorAll('figure');
    const images = Array.from(figures).slice(0, 20).map(figure => {
        const anchor = figure.querySelector('a');
        const img = figure.querySelector('img');
        if (!anchor || !img) return null;

        const title = anchor.getAttribute('title') || 'Untitled';
        const imageUrl = anchor.href || '';
        const srcset = img.srcset || '';
        
        // Extract the thumbnail URL (300w) from srcset
        const thumbnailUrl = srcset.split(',')
            .map(s => s.trim().split(' '))
            .find(([url, size]) => size === '300w')?.[0] || img.src;

        return {
            title: title,
            imageUrl: imageUrl,
            thumbnailUrl: thumbnailUrl
        };
    }).filter(Boolean);

    const data = {
        url: window.location.href,
        images: images
    };

    console.log("Extracted data:", data);
    chrome.runtime.sendMessage({action: "sendDataToFlask", data: data});
}

function waitForImages() {
    return new Promise((resolve) => {
        const checkImages = () => {
            const images = document.querySelectorAll('figure img');
            if (images.length > 0) {
                resolve();
            } else {
                setTimeout(checkImages, 100);
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
