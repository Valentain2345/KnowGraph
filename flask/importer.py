from flask import Flask, request, jsonify
import io
import csv
import pandas as pd
import json


app = Flask(__name__)


uploaded_files = {}
csvDataframes={}
jsonDataframes={}
sqlDataframes={}
excelDataframes={}
xmlDataframes={}


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
    return jsonify({'message': 'All files cleared from memory'})

@app.route('/remove/<filename>', methods=['GET'])
def remove_file(filename):
    if filename not in uploaded_files:
        return jsonify({'error': 'File not found'}), 404
    uploaded_files.pop(filename)
    return jsonify({'message': f'{filename} deleted correctly'})




def read_CSV_into_dataframe(filename):
    file_data = uploaded_files[filename]
    preview = file_data[:1024].decode('utf-8', errors='ignore')
    dialect = csv.Sniffer().sniff(preview)
    df = pd.read_csv(io.StringIO(file_data), sep=dialect.delimiter)
    csvDataframes[filename]=df
    print(f" Loaded {filename} (delimiter: {repr(dialect.delimiter)})")



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
    file_data = upload_files[filename]
    json_type=detect_json_type(file_data)

    if  json_type=="json":
        df=pd.read_json(io.StringIO(file_data))
    elif json_type == "jsonlines":
        df = pd.read_json(io.StringIO(filedata), lines=True)
    else:
        print(f"Warning: Could not detect JSON type for {filename}. Exiting.")

    jsonDataframes[filename]=df

def read_Excel_into_dataframe(filename):
    file_data = upload_files[filename]
    dfs=pd.read_excel(io.StringIO(file_data),sheet_name=none)
    for sheet_name, df in dfs.items():
        dfName=filename+" "+sheet_name
        excelDataframes[dfName]=df

def read_XML_into_dataframe(filename):
    file_data = upload_files[filename]
    df=pd.read_xml(io.StringIO(file_data))






if __name__ == '__main__':
    app.run(debug=True)
