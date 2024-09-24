from flask import Flask, render_template, request, redirect

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search')
def search():
    query = request.args.get('query', '')
    orientation = request.args.get('orientation', '')
    
    url = f"https://unsplash.com/s/photos/{query}"
    if orientation:
        url += f"?orientation={orientation}"
    
    return redirect(url)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
