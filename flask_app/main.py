from flask import Flask, render_template, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import json
from datetime import datetime
import os
from urllib.parse import urlencode
import time
import requests
import logging

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure logging
logging.basicConfig(level=logging.INFO)

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
        logging.info(f"Received {len(data['images'])} images")
        # Add sequential ID to each image
        for index, image in enumerate(data['images'], start=1):
            image['id'] = index
            logging.info(f"Added ID {image['id']} to image: {image['title']}")

        # Ensure we only process up to 4 images
        latest_images = data['images'][:4]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"extracted_data_{timestamp}.json"
        file_path = os.path.join(downloaded_files_path, filename)

        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)

        logging.info(f"New data received and saved: {filename}")
        return jsonify({"message": "Data received and saved successfully", "filename": filename})
    else:
        return jsonify({"error": "Invalid data format"}), 400

@app.route('/status')
def status():
    logging.info("Status endpoint accessed")
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
                    logging.info(f"Sending SSE update with {len(latest_images)} images")
                    yield f"data: {current_update}\n\n"
            time.sleep(1)  # Check for updates every second

    return Response(event_stream(), content_type='text/event-stream')

@app.route('/analyze_images', methods=['POST'])
def analyze_images():
    # Find the most recent JSON file
    json_files = [f for f in os.listdir(downloaded_files_path) if f.endswith('.json')]
    if not json_files:
        return jsonify({"error": "No JSON files found"}), 400
    latest_file = max(json_files, key=lambda x: os.path.getctime(os.path.join(downloaded_files_path, x)))

    # Read the JSON file
    with open(os.path.join(downloaded_files_path, latest_file), 'r') as f:
        data = json.load(f)

    # Extract thumbnail URLs and map them to image IDs
    images = [{"id": img['id'], "thumbnailUrl": img['thumbnailUrl']} for img in data['images']]

    prompt = "Analyze the following images and return which image  would be most suitable for an article cover image, and that most closely matches the description: 'A person working on a laptop.' Return a JSON object with the image_number based on the payload order, as well as and a web-friendly alt text description (up to 125 characters) written as alt_text. If none of the images fit, return 'none' for image_number."

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt}
                ] + [
                    {
                        "type": "image_url",
                        "image_url": {"url": image['thumbnailUrl']}
                    } for image in images
                ]
            }
        ],
        "max_tokens": 300
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"
    }

    try:
        logging.info("Sending request to GPT-4o API")
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        if "choices" in result:
            message_content = json.loads(result['choices'][0]['message']['content'])
            logging.info(f"GPT-4o API response: {message_content}")

            image_number = message_content.get('image_number', 'none')
            alt_text = message_content.get('alt_text', '')

            return jsonify({
                "image_number": image_number,
                "alt_text": alt_text
            })
        else:
            logging.error(f"Unexpected API response: {result}")
            return jsonify({"error": "Unexpected API response"}), 500
    except Exception as e:
        logging.error(f"Error in analyze_images: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)