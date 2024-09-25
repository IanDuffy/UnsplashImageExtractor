// content_app.js

console.log("Content script for the app is running.");

document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const query = document.getElementById('searchQuery').value;
    const plusLicense = document.getElementById('plusLicense').checked;

    fetch(`/search?query=${encodeURIComponent(query)}&plus_license=${plusLicense}`)
        .then(response => response.json())
        .then(data => {
            if (data.search_url) {
                // Send a message to the extension to open the tab
                chrome.runtime.sendMessage({
                    action: "openTab",
                    url: data.search_url
                });
            } else {
                console.error('No search_url returned from the backend.');
                alert('Failed to generate search URL. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
            alert('An error occurred while searching. Please try again.');
        });
});
