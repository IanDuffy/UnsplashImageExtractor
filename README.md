# Unsplash Image Extractor and Viewer

This project consists of a Chrome extension for extracting Unsplash images and a Flask app for displaying the results.

## Chrome Extension

### Installation
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `extension` folder

### Usage
1. Click on the extension icon in Chrome
2. Enter a search query and optionally check "Plus Images"
3. Click "Search" to extract images from Unsplash
4. Review the image previews in the popup
5. Click "Confirm and Save JSON" to download the extracted data

## Flask App

### Installation
1. Make sure you have Python installed
2. Navigate to the `flask_app` directory
3. Install the required packages: `pip install flask`

### Usage
1. Run the Flask app: `python main.py`
2. Open a web browser and go to `http://localhost:5000`
3. Upload the JSON file generated by the Chrome extension
4. View the extracted images on the web page

Note: The Flask app runs locally and doesn't require server deployment.
