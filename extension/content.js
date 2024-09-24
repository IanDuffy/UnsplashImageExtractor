chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "extract") {
        extractImageData();
    }
});

function extractImageData() {
    const figures = document.querySelectorAll('figure');
    const images = Array.from(figures).map(figure => {
        const anchor = figure.querySelector('a');
        const img = figure.querySelector('img');
        return {
            title: anchor.getAttribute('title'),
            imageUrl: 'https://unsplash.com' + anchor.getAttribute('href'),
            thumbnailUrl: img.srcset.split(',').find(src => src.includes('300w')).trim().split(' ')[0],
            orientation: getImageOrientation(img)
        };
    });

    chrome.runtime.sendMessage({
        action: "sendDataToFlask",
        data: {
            url: window.location.href,
            images: images
        }
    });
}

function getImageOrientation(img) {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    return width > height ? 'landscape' : 'portrait';
}

extractImageData();
