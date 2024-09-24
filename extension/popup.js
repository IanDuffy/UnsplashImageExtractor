document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchQuery = document.getElementById('searchQuery');
    const plusLicense = document.getElementById('plusLicense');
    const message = document.getElementById('message');
    const imageGrid = document.getElementById('imageGrid');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchQuery.value;
        const usePlusLicense = plusLicense.checked;
        
        message.textContent = 'Searching...';
        
        chrome.tabs.create({ url: constructSearchUrl(query, usePlusLicense), active: false }, function(tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }, function() {
                chrome.tabs.sendMessage(tab.id, { action: "extract" });
            });
        });
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "updatePopup") {
            displayExtractedData(request.data);
        }
    });

    function constructSearchUrl(query, usePlusLicense) {
        let url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
        
        if (usePlusLicense) {
            url += '?license=plus';
        }
        
        return url;
    }

    function displayExtractedData(data) {
        if (!data || !data.images) {
            message.textContent = 'No data available';
            return;
        }

        message.textContent = `Extracted ${data.images.length} images`;
        imageGrid.innerHTML = '';

        data.images.forEach(image => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container';

            const img = document.createElement('img');
            img.src = image.thumbnailUrl;
            img.alt = image.title;

            const title = document.createElement('p');
            title.textContent = image.title;

            imgContainer.appendChild(img);
            imgContainer.appendChild(title);
            imageGrid.appendChild(imgContainer);
        });
    }

    // Check for existing data when popup opens
    chrome.runtime.sendMessage({action: "getExtractedData"}, function(response) {
        if (response && response.data) {
            displayExtractedData(response.data);
        }
    });
});
