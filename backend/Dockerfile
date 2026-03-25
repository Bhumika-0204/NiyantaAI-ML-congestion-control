FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if required for ML models or system monitoring (psutil)
RUN apt-get update && apt-get install -y gcc g++ libc-dev linux-libc-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install existing dependencies and add the new agents ones
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir psutil chromadb openai

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
