document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchQuery = document.getElementById('searchQuery');
    const orientation = document.getElementById('orientation');
    const plusLicense = document.getElementById('plusLicense');
    const message = document.getElementById('message');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchQuery.value;
        const selectedOrientation = orientation.value;
        const usePlusLicense = plusLicense.checked;
        
        message.textContent = 'Searching...';
        
        chrome.tabs.create({ url: constructSearchUrl(query, selectedOrientation, usePlusLicense), active: false }, function(tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }, function() {
                chrome.tabs.sendMessage(tab.id, { action: "extract" });
            });
        });
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "showMessage") {
            message.textContent = request.message;
        }
    });

    function constructSearchUrl(query, orientation, usePlusLicense) {
        let url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
        let params = [];
        
        if (orientation) {
            params.push(`orientation=${orientation}`);
        }
        
        if (usePlusLicense) {
            params.push('license=plus');
        }
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        return url;
    }
});
