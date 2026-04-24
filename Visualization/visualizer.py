from flask import Flask, request, jsonify
import uuid
import numpy as np
import pandas as pd
import umap
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Optional, Dict, Any
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory storage
RESULTS: Dict[str, Dict[str, Any]] = {}

# ----------------------------------------------------------------------
# Helper
# ----------------------------------------------------------------------
def _shorten(s: str, max_len: int = 30) -> str:
    s = str(s)
    if len(s) <= max_len:
        return s
    return "..." + s[-(max_len - 3):]

# ----------------------------------------------------------------------
# Auto-detect label column
# ----------------------------------------------------------------------
def auto_detect_label(df: pd.DataFrame) -> Optional[str]:
    candidates = []
    for col in df.columns:
        if df[col].dtype == object or pd.api.types.is_string_dtype(df[col]):
            nuniq = df[col].nunique()
            if 1 < nuniq <= 50:
                candidates.append((col, nuniq))
    if not candidates:
        return None
    candidates.sort(key=lambda x: x[1])
    return candidates[0][0]

# ----------------------------------------------------------------------
# Preprocess
# ----------------------------------------------------------------------
def load_and_preprocess(
    df: pd.DataFrame,
    label_col: Optional[str],
    text_cols: List[str],
    max_onehot_card: int,
) -> tuple[np.ndarray, Optional[pd.Series], pd.Index]:
    label_series = df[label_col].copy() if label_col else None
    work_df = df.drop(columns=[label_col]) if label_col else df.copy()
    numeric_cols = work_df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols: List[str] = []
    text_cols = list(set(text_cols))
    for col in work_df.columns:
        if col in numeric_cols:
            continue
        nuniq = work_df[col].nunique()
        if col in text_cols or nuniq > max_onehot_card:
            if col not in text_cols:
                text_cols.append(col)
        else:
            categorical_cols.append(col)

    parts: List[np.ndarray] = []
    if numeric_cols:
        num_data = work_df[numeric_cols].fillna(0)
        scaler = StandardScaler()
        parts.append(scaler.fit_transform(num_data))
    if categorical_cols:
        cat_data = work_df[categorical_cols].fillna("__missing__")
        enc = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
        parts.append(enc.fit_transform(cat_data))
    if text_cols:
        text_series = work_df[text_cols].fillna("").astype(str).agg(" | ".join, axis=1)
        vec = TfidfVectorizer(max_features=999, sublinear_tf=True)
        parts.append(vec.fit_transform(text_series).toarray())

    X = np.hstack(parts) if parts else np.empty((len(work_df), 0))
    X_z = StandardScaler().fit_transform(X) if X.shape[1] > 0 else X
    return X_z, label_series, df.index

# ----------------------------------------------------------------------
# Dimension reduction
# ----------------------------------------------------------------------
def run_pca(X: np.ndarray, n: int) -> np.ndarray:
    return PCA(n_components=n, random_state=42).fit_transform(X)

def run_tsne(X: np.ndarray, n: int, perplexity: float, seed: int) -> np.ndarray:
    return TSNE(
        n_components=n,
        perplexity=perplexity,
        random_state=seed,
        learning_rate="auto",
        max_iter=1000,
        init="pca",
    ).fit_transform(X)

def run_umap(X: np.ndarray, n: int, n_neighbors: int, min_dist: float, seed: int) -> np.ndarray:
    return umap.UMAP(
        n_components=n,
        n_neighbors=n_neighbors,
        min_dist=min_dist,
        metric="euclidean",
        random_state=seed,
    ).fit_transform(X)

# ----------------------------------------------------------------------
# Convert to JSON points
# ----------------------------------------------------------------------
def make_points(
    embedding: np.ndarray,
    dim: int,
    label_series: Optional[pd.Series],
    idx: pd.Index,
) -> List[Dict[str, Any]]:
    points = []
    labels = None
    if label_series is not None:
        labels = label_series.fillna("NA").astype(str).apply(_shorten).tolist()
    for i in range(embedding.shape[0]):
        point: Dict[str, Any] = {
            "id": str(idx[i]),
            "x": float(embedding[i, 0]),
            "y": float(embedding[i, 1]),
        }
        if dim == 3:
            point["z"] = float(embedding[i, 2])
        if labels is not None:
            point["label"] = labels[i]
        points.append(point)
    return points

# ----------------------------------------------------------------------
# POST /upload → preprocess only
# ----------------------------------------------------------------------
@app.route("/upload", methods=["POST"])
def upload():
    if "csv" not in request.files:
        return jsonify({"error": "Missing csv file"}), 400
    file = request.files["csv"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    label_col = request.form.get("label_col") or None
    text_cols_input = request.form.get("text_cols", "")
    text_cols = [c.strip() for c in text_cols_input.split(",") if c.strip()]
    try:
        max_onehot_card = int(request.form.get("max_onehot_cardinality", 20))
        seed = int(request.form.get("seed", 42))
        tsne_perplexity = float(request.form.get("tsne_perplexity", 30.0))
        umap_n_neighbors = int(request.form.get("umap_n_neighbors", 15))
        umap_min_dist = float(request.form.get("umap_min_dist", 0.1))
    except ValueError as e:
        return jsonify({"error": f"Invalid parameter: {e}"}), 400

    try:
        df = pd.read_csv(file.stream)
    except Exception as e:
        return jsonify({"error": f"Failed to read CSV: {str(e)}"}), 400
    if df.empty:
        return jsonify({"error": "CSV is empty"}), 400

    detected = False
    if not label_col:
        label_col = auto_detect_label(df)
        if label_col:
            detected = True

    try:
        X_z, label_series, idx = load_and_preprocess(df, label_col, text_cols, max_onehot_card)
        if X_z.shape[1] == 0:
            return jsonify({"error": "No features after preprocessing"}), 400
        RESULTS.clear()
        job_id = str(uuid.uuid4())
        RESULTS[job_id] = {
            "X_z": X_z,
            "label_series": label_series,
            "idx": idx,
            "params": {
                "seed": seed,
                "tsne_perplexity": tsne_perplexity,
                "umap_n_neighbors": umap_n_neighbors,
                "umap_min_dist": umap_min_dist,
            },
            "label_col": label_col,
            "cache": {},
        }

        return jsonify({
            "job_id": job_id,
            "label_col": label_col or "none",
            "auto_detected": detected,
            "rows": len(df),
            "features": X_z.shape[1],
            "message": "Preprocessed. Embeddings computed on demand."
        })
    except Exception as e:
        return jsonify({"error": f"Preprocessing failed: {str(e)}"}), 500

# ----------------------------------------------------------------------
# GET /embeddings/<job_id>/<method>/<dim> → lazy compute
# ----------------------------------------------------------------------
@app.route("/embeddings/<job_id>/<method>/<dim>", methods=["GET"])
def get_embeddings(job_id: str, method: str, dim: str):
    if job_id not in RESULTS:
        return jsonify({"error": "Unknown job_id"}), 404

    job = RESULTS[job_id]
    method = method.lower()
    if method not in {"pca", "tsne", "umap"}:
        return jsonify({"error": "method must be pca|tsne|umap"}), 400
    if dim not in {"2d", "3d"}:
        return jsonify({"error": "dim must be 2d|3d"}), 400

    n_components = 3 if dim == "3d" else 2
    cache_key = f"{method}_{dim}"

    if cache_key not in job["cache"]:
        X_z = job["X_z"]
        params = job["params"]
        try:
            if method == "pca":
                embedding = run_pca(X_z, n_components)
            elif method == "tsne":
                embedding = run_tsne(X_z, n_components, params["tsne_perplexity"], params["seed"])
            elif method == "umap":
                embedding = run_umap(X_z, n_components, params["umap_n_neighbors"], params["umap_min_dist"], params["seed"])
            points = make_points(embedding, n_components, job["label_series"], job["idx"])
            job["cache"][cache_key] = points
        except Exception as e:
            return jsonify({"error": f"Computation failed: {str(e)}"}), 500

    data = job["cache"][cache_key]
    return jsonify({
        "job_id": job_id,
        "method": method,
        "dim": dim,
        "label_col": job.get("label_col"),
        "count": len(data),
        "data": data,
    })

# ----------------------------------------------------------------------
# List jobs
# ----------------------------------------------------------------------
@app.route("/currentJobs", methods=["GET"])
def list_jobs():
    job_ids = list(RESULTS.keys())
    return jsonify({
        "job_ids": job_ids,
        "count": len(job_ids)
    })

@app.route("/status/<job_id>", methods=["GET"])
def job_status(job_id):
    if job_id not in RESULTS:
        return jsonify({"status": "not_found"}), 404

    method = request.args.get("method")
    dim = request.args.get("dim")
    if method and dim:
        cache_key = f"{method}_{dim}"
        cached = cache_key in RESULTS[job_id]["cache"]
        return jsonify({"status": "ready", "cached": cached, "job_id": job_id})
    return jsonify({"status": "ready", "job_id": job_id})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
