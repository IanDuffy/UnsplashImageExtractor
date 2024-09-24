from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_json():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith('.json'):
        try:
            data = json.load(file)
            return jsonify(data)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON file"}), 400
    else:
        return jsonify({"error": "Invalid file type. Please upload a JSON file."}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
