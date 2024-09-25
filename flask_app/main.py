from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Ensure the 'downloaded_files' folder exists
downloaded_files_path = os.path.join(os.getcwd(), 'downloaded_files')
os.makedirs(downloaded_files_path, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search')
def search():
    query = request.args.get('query', '')
    plus_license = request.args.get('plus_license', '')
    
    url = f"https://unsplash.com/s/photos/{query}"
    if plus_license:
        url += '?license=plus'
    
    # Fetch the latest extracted data
    latest_file = get_latest_file()
    if latest_file:
        with open(os.path.join(downloaded_files_path, latest_file), 'r') as f:
            data = json.load(f)
        return jsonify({"search_url": url, "images": data['images']})
    else:
        return jsonify({"search_url": url, "images": []})

@app.route('/receive_data', methods=['POST'])
def receive_data():
    data = request.json
    # Ensure we only process up to 20 images
    data['images'] = data['images'][:20]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"extracted_data_{timestamp}.json"
    file_path = os.path.join(downloaded_files_path, filename)
    
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    return jsonify({"message": "Data received and saved successfully", "filename": filename, "images": data['images']})

@app.route('/status')
def status():
    return jsonify({"status": "running"})

def get_latest_file():
    files = [f for f in os.listdir(downloaded_files_path) if f.endswith('.json')]
    if files:
        return max(files, key=lambda f: os.path.getmtime(os.path.join(downloaded_files_path, f)))
    return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
