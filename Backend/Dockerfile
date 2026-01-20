# Gunakan Python
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install dependencies sistem (jika perlu untuk psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Salin requirements dan install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn psycopg2-binary

# Salin semua kode backend
COPY . .

# Collect Static (agar CSS admin panel muncul)
RUN python manage.py collectstatic --noinput

# Jalankan Gunicorn (Server Production)
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:$PORT"]