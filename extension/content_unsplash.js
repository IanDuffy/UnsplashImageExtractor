console.log('Content script loaded for Unsplash');

let extractedImages = [];
let observer;

function extractImageData() {
    const figures = document.querySelectorAll('figure');
    figures.forEach(figure => {
        if (!figure.dataset.extracted) {
            const linkElement = figure.querySelector('a');
            const imgElement = figure.querySelector('img');
            
            if (linkElement && imgElement) {
                const imageUrl = 'https://unsplash.com' + linkElement.getAttribute('href');
                const thumbnailUrl = imgElement.src;
                const title = imgElement.alt;

                extractedImages.push({
                    imageUrl,
                    thumbnailUrl,
                    title
                });

                figure.dataset.extracted = 'true';
            }
        }
    });

    if (extractedImages.length > 0) {
        chrome.runtime.sendMessage({
            action: "sendDataToFlask",
            data: { images: extractedImages }
        });
    }
}

function setupObserver() {
    observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                extractImageData();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function init() {
    extractImageData();
    setupObserver();
}

// Run the init function when the page is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Clean up observer when navigating away from the page
window.addEventListener('beforeunload', () => {
    if (observer) {
        observer.disconnect();
    }
});
