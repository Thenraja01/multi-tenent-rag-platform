# FastAPI Multi-Tenant RAG Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PostgreSQL & build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
