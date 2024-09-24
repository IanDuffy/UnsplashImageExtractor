let extractedData = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "storeData") {
        extractedData = request.data;
        chrome.runtime.sendMessage({ action: "displayResults", data: extractedData });
    } else if (request.action === "saveJSON") {
        if (extractedData) {
            const jsonString = JSON.stringify(extractedData, null, 2);
            const blob = new Blob([jsonString], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            
            chrome.downloads.download({
                url: url,
                filename: "unsplash_images.json",
                saveAs: true
            }, function(downloadId) {
                if (chrome.runtime.lastError) {
                    chrome.runtime.sendMessage({ action: "showMessage", message: "Error saving JSON file." });
                } else {
                    chrome.runtime.sendMessage({ action: "showMessage", message: "JSON file saved successfully." });
                }
            });
        } else {
            chrome.runtime.sendMessage({ action: "showMessage", message: "No data to save. Please perform a search first." });
        }
    }
});
