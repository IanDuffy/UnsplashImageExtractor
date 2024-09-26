from flask import Flask, render_template, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import json
from datetime import datetime
import os
from urllib.parse import urlencode
import time
import uuid

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Ensure the 'downloaded_files' folder exists
downloaded_files_path = os.path.join(os.getcwd(), 'downloaded_files')
os.makedirs(downloaded_files_path, exist_ok=True)

# Global variable to store the latest images
latest_images = []

@app.route('/')
def index():
    return render_template('index.html', images=latest_images)

@app.route('/search')
def search():
    query = request.args.get('query', '')
    orientation = request.args.get('orientation', '')
    order = request.args.get('order', 'relevance')
    plus_license = request.args.get('plus_license', '').lower() == 'true'
    
    url = f"https://unsplash.com/s/photos/{query}"
    params = {}
    
    if orientation:
        params['orientation'] = orientation
    
    if order != 'relevance':
        params['order_by'] = order
    
    if plus_license:
        params['license'] = 'plus'
    
    if params:
        url += '?' + urlencode(params)
    
    return jsonify({"search_url": url})

@app.route('/receive_data', methods=['POST'])
def receive_data():
    global latest_images
    data = request.json
    if data and 'images' in data:
        print(f"Received {len(data['images'])} images")  # Debug log
        # Add unique ID to each image
        for image in data['images']:
            image['id'] = str(uuid.uuid4())
            print(f"Added ID {image['id']} to image: {image['title']}")  # Debug log
        
        # Ensure we only process up to 20 images
        latest_images = data['images'][:20]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"extracted_data_{timestamp}.json"
        file_path = os.path.join(downloaded_files_path, filename)
        
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"New data received and saved: {filename}")  # Debug log
        return jsonify({"message": "Data received and saved successfully", "filename": filename})
    else:
        return jsonify({"error": "Invalid data format"}), 400

@app.route('/status')
def status():
    print("Status endpoint accessed")
    return jsonify({"status": "running"})

@app.route('/downloaded_files/<path:filename>')
def downloaded_files(filename):
    return send_from_directory(downloaded_files_path, filename)

@app.route('/sse')
def sse():
    def event_stream():
        global latest_images
        last_update = None
        while True:
            if latest_images:
                current_update = json.dumps(latest_images)
                if current_update != last_update:
                    last_update = current_update
                    print(f"Sending SSE update with {len(latest_images)} images")  # Debug log
                    yield f"data: {current_update}\n\n"
            time.sleep(1)  # Check for updates every second

    return Response(event_stream(), content_type='text/event-stream')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
