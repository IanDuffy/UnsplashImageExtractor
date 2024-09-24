chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "sendDataToFlask") {
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
        console.log("Data sent to Flask app successfully.");
    })
    .catch((error) => {
        console.error("Error sending data to Flask app: " + error);
    });
}
