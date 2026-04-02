import multiprocessing

# Gunicorn configuration file
# https://docs.gunicorn.org/en/stable/configure.html

# Worker configuration
# Rule of thumb: 2-4 x $(NUM_CORES) workers
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"

# Bind address
bind = "0.0.0.0:8000"

# Timeouts and keep-alive
timeout = 120
keepalive = 5

# Logging
loglevel = "info"
accesslog = "-"
errorlog = "-"

# App
wsgi_app = "app.main:app"
