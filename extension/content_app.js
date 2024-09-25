// content_app.js

console.log("Content script for the app is running.");

const APP_ORIGIN = window.location.origin;

window.addEventListener("message", function(event) {
    // Only accept messages from the app's origin
    if (event.origin !== APP_ORIGIN) {
        console.warn(`Rejected message from origin ${event.origin}`);
        return;
    }

    if (event.data && event.data.type === "OPEN_UNSPLASH_TAB") {
        const url = event.data.url;
        if (url) {
            console.log("Received OPEN_UNSPLASH_TAB message with URL:", url);
            chrome.runtime.sendMessage({ action: "openTab", url: url }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message to background script:', chrome.runtime.lastError);
                } else {
                    console.log('Background script response:', response);
                }
            });
        } else {
            console.error('No URL provided in the message.');
        }
    }
}, false);
