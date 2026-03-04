# Stage 1: Builder
FROM python:3.13-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
        build-base \
        musl-dev \
        python3-dev \
        libffi-dev \
        zlib-dev \
        bzip2-dev \
        xz-dev \
        bash \
        curl

WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip wheel setuptools

# Copy requirements and install
COPY requirements.txt .
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.13-alpine

WORKDIR /app

# Copy installed packages and executables
COPY --from=builder /install /usr/local

# Copy application code
COPY importer.py .

# Create non‑root user and data directory
RUN adduser -D appuser \
    && mkdir -p /app/data \
    && chown appuser:appuser /app/data


USER appuser

EXPOSE 5001
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/usr/local/bin:$PATH"

# Run Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "importer:app", "--workers", "1", "--threads", "4", "--log-level", "info"]
