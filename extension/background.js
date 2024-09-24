console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated');
  testFlaskConnection();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "sendDataToFlask") {
        console.log("Received data from content script:", request.data);
        sendDataToFlaskApp(request.data);
    }
    sendResponse({received: true});
    return true; // Keep the message channel open for asynchronous response
});

function sendDataToFlaskApp(data, retryCount = 0) {
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
            errorMessage += "Could not establish connection. ";
            if (retryCount < 3) {
                errorMessage += "Retrying in 5 seconds...";
                chrome.runtime.sendMessage({
                    action: "showMessage",
                    message: errorMessage
                });
                setTimeout(() => sendDataToFlaskApp(data, retryCount + 1), 5000);
                return;
            } else {
                errorMessage += "Max retries reached. Please check your internet connection and try again later.";
            }
        } else if (error.name === 'AbortError') {
            errorMessage += "The request was aborted. Please try again.";
        } else if (error instanceof SyntaxError) {
            errorMessage += "Received invalid JSON from the server. Please try again later.";
        } else if (error.message.includes('HTTP error!')) {
            errorMessage += `Server error: ${error.message}. Please try again later.`;
        } else {
            errorMessage += error.message;
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
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Flask app status:", data.status);
            chrome.runtime.sendMessage({
                action: "showMessage",
                message: `Flask app status: ${data.status}`
            });
        })
        .catch(error => {
            console.error("Error checking Flask app status:", error);
            let errorMessage = "Error checking Flask app status. ";

            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                errorMessage += "Could not establish connection. Please check your internet connection.";
            } else if (error.name === 'AbortError') {
                errorMessage += "The request was aborted. Please try again.";
            } else if (error instanceof SyntaxError) {
                errorMessage += "Received invalid JSON from the server. Please try again later.";
            } else if (error.message.includes('HTTP error!')) {
                errorMessage += `Server error: ${error.message}. Please try again later.`;
            } else {
                errorMessage += error.message;
            }

            chrome.runtime.sendMessage({
                action: "showMessage",
                message: errorMessage
            });
        });
}

function testFlaskConnection() {
  fetch('https://d5c32f3d-ed8e-45c1-92dc-76e619b42552-00-2d5g7pwkbt0zo.janeway.replit.dev/status')
    .then(response => response.json())
    .then(data => {
      console.log('Flask app connection test successful:', data);
      chrome.runtime.sendMessage({
        action: "showMessage",
        message: "Flask app connection test successful"
      });
    })
    .catch(error => {
      console.error('Flask app connection test failed:', error);
      let errorMessage = "Flask app connection test failed: ";
      
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        errorMessage += "Could not establish connection. Please check your internet connection.";
      } else {
        errorMessage += error.message;
      }
      
      chrome.runtime.sendMessage({
        action: "showMessage",
        message: errorMessage
      });
    });
}

// Add periodic status check
setInterval(checkFlaskAppStatus, 60000); // Check every minute
