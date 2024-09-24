document.addEventListener('DOMContentLoaded', function() {
    const extractButton = document.getElementById('extractButton');
    const message = document.getElementById('message');

    extractButton.addEventListener('click', function() {
        message.textContent = 'Extracting images...';
        chrome.runtime.sendMessage({ action: "startExtraction" });
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "showMessage") {
            message.textContent = request.message;
        }
    });
});
