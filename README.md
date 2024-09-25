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
4. The extension will automatically extract image data and send it to the Flask app

## Flask App

### Installation
1. Make sure you have Python installed
2. Navigate to the `flask_app` directory
3. Install the required packages: `pip install flask flask-cors`

### Usage
1. Run the Flask app: `python main.py`
2. Open a web browser and go to `http://localhost:5000`
3. The Flask app will automatically display the latest extracted images
4. The page refreshes every 10 seconds to show new data

## Project Structure
- `extension/`: Contains all files for the Chrome extension
- `flask_app/`: Contains the Flask application files
  - `main.py`: The main Flask application
  - `templates/`: HTML templates
  - `static/`: CSS and other static files
- `downloaded_files/`: Stores the JSON files with extracted image data

Note: The Flask app runs locally and doesn't require server deployment. The Chrome extension communicates with the Flask app to send extracted data.
