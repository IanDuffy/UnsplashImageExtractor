document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchQuery = document.getElementById('searchQuery');
    const plusLicense = document.getElementById('plusLicense');
    const message = document.getElementById('message');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchQuery.value;
        const usePlusLicense = plusLicense.checked;
        
        message.textContent = 'Searching...';
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            chrome.tabs.create({ 
                url: constructSearchUrl(query, usePlusLicense), 
                active: false 
            }, function(newTab) {
                chrome.scripting.executeScript({
                    target: { tabId: newTab.id },
                    files: ['content.js']
                }, function() {
                    chrome.tabs.sendMessage(newTab.id, { action: "extract" });
                    // Focus back on the original tab
                    chrome.tabs.update(currentTab.id, {active: true});
                });
            });
        });

        message.textContent = 'Search opened in background tab. Extracting images...';
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "showMessage") {
            message.textContent = request.message;
        }
    });

    function constructSearchUrl(query, usePlusLicense) {
        let url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
        
        if (usePlusLicense) {
            url += '?license=plus';
        }
        
        return url;
    }
});
