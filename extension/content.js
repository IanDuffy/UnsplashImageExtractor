chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "extract") {
        extractImageData();
    }
});

function extractImageData() {
    const totalResults = document.querySelector('[data-testid="search-nav-link-photos"]').textContent;
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
        action: "storeData",
        data: {
            totalResults: totalResults,
            images: images
        }
    });
}

function getImageOrientation(img) {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    return width > height ? 'landscape' : 'portrait';
}

// Simulate scrolling to load all images
function simulateScrolling() {
    return new Promise((resolve) => {
        let lastHeight = document.body.scrollHeight;
        let scrollAttempts = 0;
        const maxScrollAttempts = 10;

        function scroll() {
            window.scrollTo(0, document.body.scrollHeight);
            setTimeout(() => {
                if (document.body.scrollHeight > lastHeight && scrollAttempts < maxScrollAttempts) {
                    lastHeight = document.body.scrollHeight;
                    scrollAttempts++;
                    scroll();
                } else {
                    resolve();
                }
            }, 1000);
        }

        scroll();
    });
}

// Wait for page load and simulate scrolling before extraction
window.addEventListener('load', () => {
    simulateScrolling().then(() => {
        extractImageData();
    });
});
