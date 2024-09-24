chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "sendDataToFlask") {
        console.log("Received data from content script:", request.data);
        sendDataToFlaskApp(request.data);
    }
});

function sendDataToFlaskApp(data) {
    fetch('https://d5c32f3d-ed8e-45c1-92dc-76e619b42552-00-2d5g7pwkbt0zo.janeway.replit.dev/receive_data', {
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
        chrome.runtime.sendMessage({
            action: "showMessage",
            message: "Data sent to Flask app successfully."
        });
    })
    .catch((error) => {
        console.error("Error sending data to Flask app:", error);
        let errorMessage = "Error sending data to Flask app. ";

        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            errorMessage += "This may be due to the Flask app not running or CORS issues.";
        } else if (error.name === 'AbortError') {
            errorMessage += "The request was aborted. Please try again.";
        } else if (error.name === 'NetworkError') {
            errorMessage += "A network error occurred. Please check your internet connection.";
        }

        chrome.runtime.sendMessage({
            action: "showMessage",
            message: errorMessage
        });

        // Save data locally if there's a network error
        chrome.storage.local.set({unsplashData: data}, function() {
            console.log('Data saved locally due to network error');
        });
    });
}

function checkFlaskAppStatus() {
    fetch('https://d5c32f3d-ed8e-45c1-92dc-76e619b42552-00-2d5g7pwkbt0zo.janeway.replit.dev/status')
        .then(response => response.json())
        .then(data => {
            console.log("Flask app status:", data.status);
            chrome.runtime.sendMessage({
                action: "showMessage",
                message: `Flask app status: ${data.status}`
            });
        })
        .catch(error => {
            console.error("Error checking Flask app status:", error);
            chrome.runtime.sendMessage({
                action: "showMessage",
                message: "Error checking Flask app status. Please ensure the Flask app is running and accessible."
            });
        });
}

chrome.runtime.onInstalled.addListener(() => {
    checkFlaskAppStatus();
});

// Add periodic status check
setInterval(checkFlaskAppStatus, 60000); // Check every minute
