from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search')
def search():
    query = request.args.get('query', '')
    orientation = request.args.get('orientation', '')
    plus_license = request.args.get('plus_license', '')
    
    url = f"https://unsplash.com/s/photos/{query}"
    params = []
    
    if orientation:
        params.append(f"orientation={orientation}")
    if plus_license:
        params.append("license=plus")
    
    if params:
        url += '?' + '&'.join(params)
    
    return jsonify({"search_url": url})

@app.route('/receive_data', methods=['POST'])
def receive_data():
    data = request.json
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"extracted_data_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    
    return jsonify({"message": "Data received and saved successfully", "filename": filename})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
