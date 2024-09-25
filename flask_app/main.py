from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for
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
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    images = []
    for figure in soup.find_all('figure', limit=20):
        anchor = figure.find('a', {'itemprop': 'contentUrl'})
        if anchor:
            image_url = f"https://unsplash.com{anchor['href']}"
            img = anchor.find('img', {'itemprop': 'thumbnailUrl'})
            if img:
                title = img.get('alt', 'Untitled')
                thumbnail_url = img.get('src')
                if thumbnail_url:
                    images.append({
                        'title': title,
                        'imageUrl': image_url,
                        'thumbnailUrl': thumbnail_url
                    })
    
    data = {
        'url': url,
        'imageCount': len(images),
        'images': images
    }
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"extracted_data_{timestamp}.json"
    file_path = os.path.join(downloaded_files_path, filename)
    
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    return redirect(url_for('index'))

@app.route('/status')
def status():
    print("Status endpoint accessed")
    return jsonify({"status": "running"})

@app.route('/downloaded_files/<path:filename>')
def downloaded_files(filename):
    return send_from_directory(downloaded_files_path, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
