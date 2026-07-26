# AegisUEBA Production Deployment Guide

This guide details step-by-step instructions for deploying the AegisUEBA Behavioral Anomaly Detection platform to production environments.

---

## Option 1: Docker Compose (Recommended for Production & Cloud VMs)

Docker Compose is the fastest and most reliable deployment method. It packages both the FastAPI backend and Nginx React frontend into isolated containers.

### Steps:
1. **Connect to your Linux Cloud VM / AWS EC2 / DigitalOcean Droplet**:
   ```bash
   ssh ubuntu@your-server-ip
   ```

2. **Copy/Clone the Project**:
   ```bash
   cd /opt
   git clone <your-repo-url> aegis_ueba
   cd aegis_ueba
   ```

3. **Launch Docker Containers in Detached Mode**:
   ```bash
   docker compose up -d --build
   ```

4. **Verify Container Status**:
   ```bash
   docker compose ps
   ```

5. **Access Application**:
   - **Frontend SOC Dashboard**: `http://your-server-ip:3000`
   - **Backend REST API Docs**: `http://your-server-ip:8000/docs`

---

## Option 2: Deploying to Cloud Platforms (Render / Railway / Heroku)

### A. Deploy Backend (FastAPI Web Service)
- **Environment**: Python 3.11
- **Root Directory**: `.`
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `python -m backend.main`
- **Port**: `8000`
- **Environment Variables**:
  - `SECRET_KEY`: `your-production-secret-key-2026`
  - `DATABASE_URL`: `sqlite:///./cyber_ueba.db` (or PostgreSQL URL)

### B. Deploy Frontend (Static Web Site)
- **Framework**: Vite React
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `frontend/dist`

---

## Option 3: Traditional Linux VM Deployment (Nginx + Systemd + Uvicorn)

### Step 1: Set up Backend Service (Systemd)
Create `/etc/systemd/system/aegis-backend.service`:
```ini
[Unit]
Description=AegisUEBA FastAPI Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/aegis_ueba
ExecStart=/usr/local/bin/python3 -m backend.main
Restart=always

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable aegis-backend
sudo systemctl start aegis-backend
```

### Step 2: Build Frontend & Configure Nginx
```bash
cd /opt/aegis_ueba/frontend
npm install
npm run build
```
Copy built files and configure Nginx (`/etc/nginx/sites-available/default`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /opt/aegis_ueba/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/v1/stream/ws {
        proxy_pass http://127.0.0.1:8000/api/v1/stream/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```
Reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## HTTPS SSL Certification (Optional)
To enable HTTPS with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```
