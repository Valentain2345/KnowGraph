# Stage 1: Builder
FROM python:3.13-slim AS builder

# Install build dependencies for any packages like pandas/numpy
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        gfortran \
        libopenblas-dev \
        python3-dev \
        libffi-dev \
        curl \
        git \
        zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip, wheel, setuptools
RUN pip install --upgrade pip wheel setuptools

# Copy requirements and install into a prefix that includes bin
COPY requirements.txt .
# Install packages + gunicorn so executable is available
RUN pip install --prefix=/install --no-cache-dir --prefer-binary -r requirements.txt

# Stage 2: Minimal runtime
FROM python:3.13-slim

WORKDIR /app

# Copy installed packages and binaries from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY visualizer.py .

# Create non-root user
RUN useradd --create-home appuser
USER appuser

EXPOSE 5000
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/usr/local/bin:$PATH"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://0.0.0.0:5000/', timeout=3)" || exit 1

# Use gunicorn from /usr/local/bin
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "visualizer:app", "--workers", "1", "--threads", "4", "--log-level", "info"]
