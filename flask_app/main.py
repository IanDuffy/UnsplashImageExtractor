from flask import Flask, render_template, request, jsonify, redirect, url_for, send_from_directory
from flask_cors import CORS
import json
from datetime import datetime
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Ensure the 'downloaded_files' folder exists
downloaded_files_path = os.path.join(os.getcwd(), 'downloaded_files')
os.makedirs(downloaded_files_path, exist_ok=True)

def get_most_recent_json():
    json_files = [f for f in os.listdir(downloaded_files_path) if f.endswith('.json')]
    if not json_files:
        return None
    most_recent = max(json_files, key=lambda f: os.path.getmtime(os.path.join(downloaded_files_path, f)))
    return os.path.join(downloaded_files_path, most_recent)

@app.route('/')
def index():
    most_recent_file = get_most_recent_json()
    if most_recent_file:
        with open(most_recent_file, 'r') as f:
            data = json.load(f)
        # Add a default 'filters' key if it doesn't exist
        if 'filters' not in data:
            data['filters'] = {'plus_license': False}
        return render_template('index.html', data=data)
    return render_template('index.html', data=None)

@app.route('/search')
def search():
    query = request.args.get('query', '')
    plus_license = request.args.get('plus_license', '')
    
    url = f"https://unsplash.com/s/photos/{query}"
    params = []
    
    if plus_license:
        params.append("license=plus")
    
    if params:
        url += '?' + '&'.join(params)
    
    return jsonify({"search_url": url})

@app.route('/receive_data', methods=['POST'])
def receive_data():
    data = request.json
    # Ensure we only process up to 20 images
    data['images'] = data['images'][:20]
    # Add a 'filters' key to the data
    data['filters'] = {'plus_license': 'license=plus' in data.get('url', '')}
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"extracted_data_{timestamp}.json"
    file_path = os.path.join(downloaded_files_path, filename)
    
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    return jsonify({"message": "Data received and saved successfully", "filename": filename})

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
        if file and file.filename.endswith('.json'):
            filename = secure_filename(file.filename)
            file.save(os.path.join(downloaded_files_path, filename))
            return redirect(url_for('view_data', filename=filename))
    return render_template('upload.html')

@app.route('/files')
def list_files():
    files = [f for f in os.listdir(downloaded_files_path) if f.endswith('.json')]
    return render_template('files.html', files=files)

@app.route('/view_data/<filename>')
def view_data(filename):
    file_path = os.path.join(downloaded_files_path, filename)
    if not os.path.exists(file_path):
        return "File not found", 404

    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Add a default 'filters' key if it doesn't exist
    if 'filters' not in data:
        data['filters'] = {'plus_license': False}

    return render_template('view_data.html', data=data)

@app.route('/status')
def status():
    print("Status endpoint accessed")
    return jsonify({"status": "running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
