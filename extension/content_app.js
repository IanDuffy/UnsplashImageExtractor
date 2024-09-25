// content_app.js

console.log("Content script for the app is running.");

const APP_ORIGIN = "https://d5c32f3d-ed8e-45c1-92dc-76e619b42552-00-2d5g7pwkbt0zo.janeway.replit.dev";  // Replace with your actual app's origin

window.addEventListener("message", function(event) {
    // Only accept messages from the specified origin
    if (event.origin !== APP_ORIGIN) return;

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
