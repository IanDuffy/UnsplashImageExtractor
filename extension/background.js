chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "startExtraction") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
            }, function() {
                chrome.tabs.sendMessage(tabs[0].id, { action: "extract" });
            });
        });
    } else if (request.action === "sendDataToFlask") {
        sendDataToFlaskApp(request.data);
    }
});

function sendDataToFlaskApp(data) {
    fetch('http://localhost:5000/receive_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        chrome.runtime.sendMessage({ 
            action: "showMessage", 
            message: "Data sent to Flask app successfully." 
        });
    })
    .catch((error) => {
        chrome.runtime.sendMessage({ 
            action: "showMessage", 
            message: "Error sending data to Flask app: " + error 
        });
    });
}
