# Stage 1: Builder
FROM python:3.13-slim AS builder

WORKDIR /app

# Upgrade pip for better wheel support
RUN pip install --upgrade pip

# Copy only requirements to leverage Docker cache
COPY requirements.txt .

# Install all dependencies into a separate prefix.
# - `--no-compile` avoids creating .pyc files (they won't be written anyway)
# - `--no-cache-dir` prevents pip from caching downloads
# - `--only-binary :all:` forces use of precompiled wheels – no gcc/gfortran needed
RUN pip install \
    --prefix=/install \
    --no-compile \
    --no-cache-dir \
    --only-binary :all: \
    -r requirements.txt

# Aggressively remove unnecessary files to shrink the installation
RUN find /install -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true && \
    find /install -type f \( -name '*.pyc' -o -name '*.pyo' \) -delete && \
    find /install -type d \( -name 'tests' -o -name 'test' \) -exec rm -rf {} + 2>/dev/null || true && \
    find /install -type d -name 'docs' -exec rm -rf {} + 2>/dev/null || true && \
    find /install -type f \( -name '*.c' -o -name '*.h' -o -name '*.pxd' -o -name '*.pyx' \) -delete && \
    find /install -type d -name 'include' -exec rm -rf {} + 2>/dev/null || true && \
    find /install -type d -name '.git' -exec rm -rf {} + 2>/dev/null || true

# Stage 2: Minimal runtime
FROM python:3.13-slim

WORKDIR /app

# Copy the cleaned installation from the builder
COPY --from=builder /install /usr/local

# Copy application code
COPY visualizer.py .

# Create a non‑root user
RUN useradd --create-home appuser
USER appuser

EXPOSE 5000
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/usr/local/bin:$PATH"

# Healthcheck remains unchanged
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://0.0.0.0:5000/', timeout=3)" || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "visualizer:app", "--workers", "1", "--threads", "4", "--log-level", "info"]
