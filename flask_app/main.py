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
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"extracted_data_{timestamp}.json"
    file_path = os.path.join(downloaded_files_path, filename)
    
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    return jsonify({"message": "Data received and saved successfully", "filename": filename})

@app.route('/view_data/<filename>')
def view_data(filename):
    file_path = os.path.join(downloaded_files_path, filename)
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            data = json.load(f)
        return render_template('view_data.html', data=data)
    else:
        # Get a list of available files
        available_files = [f for f in os.listdir(downloaded_files_path) if f.endswith('.json')]
        return render_template('file_not_found.html', filename=filename, available_files=available_files)

@app.route('/status')
def status():
    print("Status endpoint accessed")
    return jsonify({"status": "running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
