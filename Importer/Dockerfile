FROM python:3.13.5-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc g++ libopenblas-dev libatlas3-base \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY importer.py .

EXPOSE 5001

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5001/', timeout=3)" || exit 1

# Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "importer:app", \
     "--workers", "2", "--threads", "4", "--log-level", "info"]
