console.log('Background script loaded');

const FLASK_APP_URL = 'https://d5c32f3d-ed8e-45c1-92dc-76e619b42552-00-2d5g7pwkbt0zo.janeway.replit.dev';

let extractedData = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "sendDataToFlask") {
        console.log("Received data from content script:", request.data);
        extractedData = request.data;
        sendDataToFlaskApp(request.data);
        chrome.runtime.sendMessage({action: "updatePopup", data: extractedData});
    } else if (request.action === "getExtractedData") {
        sendResponse({data: extractedData});
    }
    return true; // Keep the message channel open for asynchronous response
});

function sendDataToFlaskApp(data) {
    fetch(`${FLASK_APP_URL}/receive_data`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        console.log("Data sent to Flask app successfully.", result);
    })
    .catch((error) => {
        console.error("Error sending data to Flask app:", error);
    });
}

function checkFlaskAppStatus() {
    fetch(`${FLASK_APP_URL}/status`)
        .then(response => response.json())
        .then(data => {
            console.log("Flask app status:", data.status);
        })
        .catch(error => {
            console.error("Error checking Flask app status:", error);
        });
}

// Add periodic status check
setInterval(checkFlaskAppStatus, 60000); // Check every minute
