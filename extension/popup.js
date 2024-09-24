document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchQuery = document.getElementById('searchQuery');
    const plusImages = document.getElementById('plusImages');
    const results = document.getElementById('results');
    const resultCount = document.getElementById('resultCount');
    const imageGrid = document.getElementById('imageGrid');
    const confirmButton = document.getElementById('confirmButton');
    const message = document.getElementById('message');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchQuery.value;
        const usePlusImages = plusImages.checked;
        
        message.textContent = 'Searching...';
        results.style.display = 'none';
        
        chrome.tabs.create({ url: constructSearchUrl(query, usePlusImages), active: false }, function(tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }, function() {
                chrome.tabs.sendMessage(tab.id, { action: "extract" });
            });
        });
    });

    confirmButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({ action: "saveJSON" });
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "displayResults") {
            displayResults(request.data);
        } else if (request.action === "showMessage") {
            message.textContent = request.message;
        }
    });

    function constructSearchUrl(query, usePlusImages) {
        let url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
        if (usePlusImages) {
            url += '?license=plus';
        }
        return url;
    }

    function displayResults(data) {
        resultCount.textContent = data.totalResults;
        imageGrid.innerHTML = '';
        
        data.images.forEach(image => {
            const imgElement = document.createElement('img');
            imgElement.src = image.thumbnailUrl;
            imgElement.alt = image.title;
            imgElement.title = image.title;
            imgElement.addEventListener('click', () => window.open(image.imageUrl, '_blank'));
            imageGrid.appendChild(imgElement);
        });

        results.style.display = 'block';
        message.textContent = '';
    }
});
