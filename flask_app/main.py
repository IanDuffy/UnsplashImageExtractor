from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import json
from datetime import datetime
import os
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Ensure the 'downloaded_files' folder exists
downloaded_files_path = os.path.join(os.getcwd(), 'downloaded_files')
os.makedirs(downloaded_files_path, exist_ok=True)

@app.route('/')
def index():
    # Get the latest JSON file from the downloaded_files directory
    json_files = [f for f in os.listdir(downloaded_files_path) if f.endswith('.json')]
    if json_files:
        latest_file = max(json_files, key=lambda x: os.path.getctime(os.path.join(downloaded_files_path, x)))
        file_path = os.path.join(downloaded_files_path, latest_file)
        with open(file_path, 'r') as f:
            data = json.load(f)
        return render_template('index.html', images=data['images'])
    else:
        return render_template('index.html', images=[])

@app.route('/search')
def search():
    query = request.args.get('query', '')
    plus_license = request.args.get('plus_license', '')
    
    url = f"https://unsplash.com/s/photos/{query}"
    if plus_license:
        url += "?license=plus"
    
    return jsonify({"search_url": url})

@app.route('/status')
def status():
    print("Status endpoint accessed")
    return jsonify({"status": "running"})

@app.route('/downloaded_files/<path:filename>')
def downloaded_files(filename):
    return send_from_directory(downloaded_files_path, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
