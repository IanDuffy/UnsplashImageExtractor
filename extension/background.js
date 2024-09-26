// background.js

console.log('Background script loaded');

const FLASK_APP_URL = 'https://d5c32f3d-ed8e-45c1-92dc-76e619b42552-00-2d5g7pwkbt0zo.janeway.replit.dev';

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed or updated');
    testFlaskConnection();
});

/**
 * Listen for messages from content scripts.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "sendDataToFlask") {
        console.log("Received data from content script:", request.data);
        sendDataToFlaskApp(request.data);
    } else if (request.action === "openTab") {
        const url = request.url;
        if (url) {
            chrome.tabs.create({ url: url, active: false }, function(tab) {
                console.log(`Opened new tab with URL: ${url}`);
                sendResponse({ status: 'success', tabId: tab.id });
            });
            // Indicate that the response will be sent asynchronously
            return true;
        } else {
            sendResponse({ status: 'error', message: 'No URL provided' });
        }
    }
    sendResponse({ received: true });
    return true; // Keep the message channel open for asynchronous response
});

function sendDataToFlaskApp(data, retryCount = 0) {
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
        if (retryCount < 3) {
            console.log(`Retrying... (Attempt ${retryCount + 1})`);
            setTimeout(() => sendDataToFlaskApp(data, retryCount + 1), 1000);
        }
    });
}

function testFlaskConnection() {
    fetch(`${FLASK_APP_URL}/status`)
        .then(response => response.json())
        .then(data => {
            console.log('Flask app connection test successful:', data);
        })
        .catch(error => {
            console.error('Flask app connection test failed:', error);
        });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('unsplash.com/s/photos/')) {
        chrome.tabs.sendMessage(tabId, { action: "extractImages" });
    }
});
