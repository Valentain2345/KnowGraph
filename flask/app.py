from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from werkzeug.utils import secure_filename
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS if using with frontend

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'json', 'parquet'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure upload directory exists
Path(UPLOAD_FOLDER).mkdir(exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_dataframe(file_path):
    file_ext = Path(file_path).suffix.lower()

    try:
        if file_ext == '.csv':
            df = pd.read_csv(file_path)
        elif file_ext in {'.xlsx', '.xls'}:
            df = pd.read_excel(file_path)
        elif file_ext == '.json':
            df = pd.read_json(file_path)
        elif file_ext == '.parquet':
            df = pd.read_parquet(file_path)
        else:
            raise ValueError("Unsupported file format")
        return df
    except Exception as e:
        raise RuntimeError(f"Error reading file: {str(e)}")

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            df = load_dataframe(file_path)

            # Get preview (first 10 rows), convert to dict
            preview = df.head(10).to_dict(orient='records')

            # Basic info
            info = {
                "shape": df.shape,
                "columns": list(df.columns),
                "dtypes": df.dtypes.apply(lambda x: str(x)).to_dict(),
                "null_counts": df.isnull().sum().to_dict(),
                "preview": preview
            }

            # Optional: basic stats for numeric columns
            if not df.select_dtypes(include=['number']).empty:
                stats = df.describe(include='number').round(2).to_dict()
                info['stats'] = stats

            # Clean up uploaded file (optional)
            os.remove(file_path)

            return jsonify({
                "message": "File processed successfully",
                "data": info
            })

        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "File type not allowed"}), 400

@app.route('/')
def index():
    return """
    <h1>Pandas File Loader API</h1>
    <p>POST a file to <code>/upload</code> with form-data key: <code>file</code></p>
    <p>Supported: CSV, Excel, JSON, Parquet</p>
    """

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
