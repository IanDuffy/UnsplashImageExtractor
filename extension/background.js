chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "sendDataToFlask") {
        console.log("Received data from content script:", request.data);
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
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            console.error("This may be due to the Flask app not running or CORS issues.");
        }
        // Save data locally if there's a network error
        chrome.storage.local.set({unsplashData: data}, function() {
            console.log('Data saved locally due to network error');
        });
    });
}

function checkFlaskAppStatus() {
    fetch('http://localhost:5000/status')
        .then(response => response.json())
        .then(data => {
            console.log("Flask app status:", data.status);
        })
        .catch(error => {
            console.error("Error checking Flask app status:", error);
        });
}

chrome.runtime.onInstalled.addListener(() => {
    checkFlaskAppStatus();
});
