function extractImageData() {
    const figures = document.querySelectorAll('figure');
    const images = Array.from(figures).map(figure => {
        const anchor = figure.querySelector('a');
        const img = figure.querySelector('img');
        if (!anchor || !img) return null;

        const title = anchor.getAttribute('title') || 'Untitled';
        const imageUrl = anchor.href || '';
        const srcset = img.srcset || '';
        const thumbnailUrl = srcset.split(',').find(src => src.includes('300w'))?.trim().split(' ')[0] || img.src;

        return {
            title: title,
            imageUrl: imageUrl,
            thumbnailUrl: thumbnailUrl,
            orientation: getImageOrientation(img)
        };
    }).filter(Boolean);

    const data = {
        url: window.location.href,
        images: images
    };

    console.log("Sending data to background script:", data);

    chrome.runtime.sendMessage({
        action: "sendDataToFlask",
        data: data
    });
}

function getImageOrientation(img) {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    return width > height ? 'landscape' : 'portrait';
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
