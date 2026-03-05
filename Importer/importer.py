from flask import Flask, request, jsonify, send_file
import io
import csv
import pandas as pd
import json
import os
import tempfile

app = Flask(__name__)


uploaded_files = {}
dataframes = {}
DATA_DIR = "/app/data"
os.makedirs(DATA_DIR, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_files():

    if 'files' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    files = request.files.getlist('files')
    stored = []

    for file in files:
        file_data = file.read()
        uploaded_files[file.filename] = file_data
        stored.append(file.filename)

    return jsonify({'message': 'Archivos subidos correctamente'})

@app.route('/dataframes', methods=['GET'])
def generateDataframes():
    generated = []

    for filename in uploaded_files.keys():
        file_type = detect_file_type(filename)

        try:
            if file_type == "csv":
                read_CSV_into_dataframe(filename)
            elif file_type == "json":
                read_JSON_into_dataframe(filename)
            elif file_type == "excel":
                read_Excel_into_dataframe(filename)
            elif file_type == "xml":
                read_XML_into_dataframe(filename)
            else:
                continue  # skip unsupported formats

            generated.append(filename)

        except Exception as e:
            print(f"Error processing {filename}: {e}")

    return jsonify({
        "message": "Dataframes generated successfully",
        "dataframes": list(dataframes.keys())
    })

@app.route('/list', methods=['GET'])
def list_files():
    return jsonify({'files': list(uploaded_files.keys())})


@app.route('/use/<filename>', methods=['GET'])
def use_file(filename):
    if filename not in uploaded_files:
        return jsonify({'error': 'File not found'}), 404

    file_data = uploaded_files[filename]
    preview = file_data[:100].decode('utf-8', errors='ignore')

    return jsonify({
        'filename': filename,
        'size_bytes': len(file_data),
        'preview': preview
    })


@app.route('/clear', methods=['GET'])
def clear_files():
    uploaded_files.clear()
    dataframes.clear()
    return jsonify({'message': 'All files cleared from memory'})

@app.route('/remove/<filename>', methods=['GET'])
def remove_file(filename):
    if filename not in uploaded_files:
        return jsonify({'error': 'File not found'}), 404
    uploaded_files.pop(filename)
    dataframes.pop(filename)
    return jsonify({'message': f'{filename} deleted correctly'})


@app.route('/rdf_all', methods=['GET'])
def rdf_all():
    ttl = generate_rdf_for_all_dataframes()
    return ttl, 200, {'Content-Type': 'text/turtle'}




@app.route('/rdf/download', methods=['GET'])
def download_rdf_graph():
    filename = "generatedGraph.ttl"
    filepath = save_all_rdf_turtle(filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "RDF file not found"}), 404

    return send_file(
        filepath,
        mimetype="text/turtle",
        as_attachment=True,
        download_name=filename
    )

def detect_file_type(filename):
    ext = filename.lower().split(".")[-1]

    if ext in ["csv"]:
        return "csv"
    if ext in ["json"]:
        return "json"
    if ext in ["xlsx", "xls"]:
        return "excel"
    if ext in ["xml"]:
        return "xml"
    return "unknown"


def read_CSV_into_dataframe(filename):
    file_bytes = uploaded_files[filename]
    file_text = file_bytes.decode("utf-8", errors="replace")

    preview = file_text[:1024]
    dialect = csv.Sniffer().sniff(preview)

    df = pd.read_csv(io.StringIO(file_text), sep=dialect.delimiter)
    dataframes[filename] = df

    print(f"Loaded {filename} (delimiter: {repr(dialect.delimiter)})")



def detect_json_type(filedata):
    filedata = filedata.strip()

    try:
        json.loads(filedata)
        return "json"
    except json.JSONDecodeError:
        pass

    lines = filedata.splitlines()
    success = True
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            json.loads(line)
        except json.JSONDecodeError:
            success = False
            break
    if success and lines:
        return "jsonlines"

    return "unknown"


def read_JSON_into_dataframe(filename):
    file_data = uploaded_files[filename].decode("utf-8", errors="ignore")
    json_type = detect_json_type(file_data)

    if json_type == "json":
        df = pd.read_json(io.StringIO(file_data))
    elif json_type == "jsonlines":
        df = pd.read_json(io.StringIO(file_data), lines=True)
    else:
        print(f"Warning: Could not detect JSON type for {filename}.")
        return

    dataframes[filename] = df

def read_Excel_into_dataframe(filename):
    file_data = uploaded_files[filename]

    dfs = pd.read_excel(io.BytesIO(file_data), sheet_name=None)

    for sheet_name, df in dfs.items():
        df_name = f"{filename}_{sheet_name}"
        dataframes[df_name] = df


def read_XML_into_dataframe(filename):
    file_data = uploaded_files[filename].decode("utf-8", errors="ignore")
    df = pd.read_xml(io.StringIO(file_data))
    dataframes[filename] = df



def dataframe_to_rdf(filename, df):
    base_uri = "http://example.org/"
    entity = os.path.splitext(filename)[0].replace(" ", "_")

    turtle = []
    turtle.append(f"@prefix ex: <{base_uri}> .\n")

    for idx, row in df.iterrows():
        subject = f"ex:{entity}_{idx}"

        for col, val in row.items():
            if pd.isna(val) or val == "":
                continue  # Skip empty columns

            pred = col.replace(" ", "_").replace("-", "_")
            obj = f"\"{val}\""

            turtle.append(f"{subject} ex:{pred} {obj} .")

    return "\n".join(turtle)

def save_rdf_turtle(filename):
    if filename not in dataframes:
        return {"error": "Dataframe not found"}

    df = dataframes[filename]
    turtle_data = dataframe_to_rdf(filename, df)

    ttl_filename = filename + ".ttl"

    with open(ttl_filename, "w", encoding="utf-8") as f:
        f.write(turtle_data)

    return {"message": f"Generated {ttl_filename}"}

def generate_rdf_for_all_dataframes():
    base_uri = "http://example.org/"
    ttl = []
    ttl.append(f"@prefix ex: <{base_uri}> .\n")

    for filename, df in dataframes.items():
        entity = os.path.splitext(filename)[0].replace(" ", "_")

        ttl.append(f"# RDF triples for {entity}\n")

        for idx, row in df.iterrows():
            subject = f"ex:{entity}_{idx}"

            for col, val in row.items():
                if pd.isna(val) or val == "":
                    continue  # Skip empty or NaN

                pred = col.replace(" ", "_").replace("-", "_")
                obj = f"\"{val}\""

                ttl.append(f"{subject} ex:{pred} {obj} .")

        ttl.append("\n")

    return "\n".join(ttl)

def save_all_rdf_turtle(filename="generatedGraph.ttl"):
    ttl_content = generate_rdf_for_all_dataframes()
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(ttl_content)
    return filepath


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=False)
