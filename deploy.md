# Deploy guide — IA-medical (on-prem Proxmox VM)

Internal deployment for **backend (FastAPI)** + **web (React)** on Ubuntu 22.04, with **MySQL managed separately** and optional **Ollama** on the LAN for chat.

## Overview

| Component | How it runs |
|-----------|-------------|
| Web UI | Static files from `frontend/web/build`, served by Nginx |
| API | Uvicorn on `127.0.0.1:8000` via systemd |
| Uploads | FastAPI `/uploads` proxied by Nginx |
| Database | External MySQL 8 (not installed by this guide) |
| LLM | Ollama at `OLLAMA_HOST` (same VM or another LAN host) |

Clinic users open `http://rheuma.local` (or VM IP) after a hosts-file entry.

## Assumptions

- SSH as user `deploy` with sudo on the app VM.
- MySQL is reachable from the VM (host, user, password, database name).
- Git repo cloned at `/opt/ia-medical`.
- Proxmox snapshot taken before deploy.
- Chat features require Ollama reachable from the VM.

## Production environment template

Create `/etc/ia-medical/env` (mode `600`, root-owned):

```bash
APP_ENV=production
DATABASE_URL=mysql+pymysql://ia_user:STRONG_PASSWORD@mysql-host:3306/rhumatoai
SECRET_KEY=GENERATE_A_LONG_RANDOM_SECRET

# Clinic browser origins (comma-separated)
CORS_ORIGINS=http://rheuma.local,http://<VM-IP>

OLLAMA_HOST=http://<ollama-host>:11434
OLLAMA_MODEL=gemma4:e4b

# Do not auto-create tables in production — use Alembic
CREATE_TABLES_ON_STARTUP=false
```

Keep real `.env` files local/private. Do not commit them to git.

## Quick checklist

### 0. Pick a release

```bash
git tag v1.0.0 && git push origin v1.0.0
# On VM: git checkout v1.0.0
```

### 1. Snapshot VM

```bash
qm snapshot <VMID> pre-deploy-$(date +%F-%H%M)
```

### 2. SSH and install packages

```bash
ssh deploy@<VM-IP>
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-venv python3-pip nginx git ufw mysql-client nodejs npm
```

### 3. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp   # optional HTTPS
sudo ufw enable
```

### 4. Deploy application code

```bash
sudo mkdir -p /opt/ia-medical
sudo chown deploy:deploy /opt/ia-medical
cd /opt/ia-medical
git clone <REPO-URL> .
git checkout <release-tag>
```

### 5. Backend virtualenv and dependencies

```bash
cd /opt/ia-medical/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

### 6. Secrets file

```bash
sudo mkdir -p /etc/ia-medical
sudo nano /etc/ia-medical/env
sudo chown root:root /etc/ia-medical/env
sudo chmod 600 /etc/ia-medical/env
```

### 7. Backup MySQL (before migrations)

```bash
mysqldump -h <mysql-host> -u <user> -p rhumatoai > /tmp/db-predeploy-$(date +%F).sql
# Copy dump off the VM
```

### 8. Run database migrations

```bash
set -a && source /etc/ia-medical/env && set +a
cd /opt/ia-medical/backend
source .venv/bin/activate
alembic upgrade head
```

### 9. Bootstrap admin (one time)

```bash
set -a && source /etc/ia-medical/env && set +a
export ADMIN_PASSWORD='your-secure-admin-password'
cd /opt/ia-medical/backend
source .venv/bin/activate
python scripts/setup_admin.py
```

Default username: `admin@chu.ma`. Do not rely on dev default `admin123` in production.

### 10. Build web frontend

```bash
cd /opt/ia-medical/frontend/web
npm ci
REACT_APP_API_URL=/api npm run build
```

Output: `frontend/web/build/` (Nginx `root`).

### 11. Persist uploads directory

```bash
sudo mkdir -p /opt/ia-medical/backend/data/uploads
sudo chown -R deploy:deploy /opt/ia-medical/backend/data
```

### 12. systemd service

Create `/etc/systemd/system/ia-medical.service`:

```ini
[Unit]
Description=IA Medical FastAPI backend
After=network.target

[Service]
User=deploy
WorkingDirectory=/opt/ia-medical/backend
EnvironmentFile=/etc/ia-medical/env
ExecStart=/opt/ia-medical/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ia-medical
sudo journalctl -u ia-medical -f
```

### 13. Nginx (static web + API proxy)

Create `/etc/nginx/sites-available/ia-medical`:

```nginx
server {
    listen 80;
    server_name rheuma.local;

    root /opt/ia-medical/frontend/web/build;
    index index.html;

    # React SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # Profile pictures and medical-act uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:8000/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Optional: direct health check without /api prefix
    location = /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/ia-medical /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 14. Clinic PCs — hosts file

```
<VM-IP>  rheuma.local
```

Windows: `C:\Windows\System32\drivers\etc\hosts` (as Administrator).

### 15. Smoke tests

On VM:

```bash
curl -s http://127.0.0.1:8000/health
curl -I http://127.0.0.1/
```

From a clinic PC:

```bash
curl -I http://rheuma.local/
curl -s http://rheuma.local/health
```

Verify Ollama (if chat is required):

```bash
curl -s "${OLLAMA_HOST}/api/tags"
```

### 16. Rollback

**Preferred:** Proxmox snapshot restore.

**Code only:**

```bash
cd /opt/ia-medical
git checkout <previous-tag>
cd frontend/web && REACT_APP_API_URL=/api npm run build
sudo systemctl restart ia-medical
sudo systemctl reload nginx
```

**Database restore:**

```bash
mysql -h <mysql-host> -u <user> -p rhumatoai < /path/db-predeploy-YYYY-MM-DD.sql
```

## Post-deploy checklist

- [ ] `SECRET_KEY` and `DATABASE_URL` are not defaults
- [ ] Admin password changed from any dev default
- [ ] `CREATE_TABLES_ON_STARTUP=false` in production
- [ ] `alembic upgrade head` succeeded
- [ ] Login works at `http://rheuma.local`
- [ ] Chat health: `/health` shows `ai_assistant` when Ollama is up
- [ ] Uploads directory backed up with DB
- [ ] Pre-deploy snapshot kept until stable

## Notes

- Do not commit `.env` or `/etc/ia-medical/env` to git.
- Mobile (Expo) is out of scope for this guide; point `REACT_APP_API_URL` at `http://<VM-IP>/api` on the device network.
- Optional LAN HTTPS: use `mkcert` and add `ssl_certificate` directives to Nginx.
- Heavy Python deps (`torch`, `transformers`) are in `requirements.txt` for RAG/embeddings; ensure sufficient RAM/disk on the VM.
