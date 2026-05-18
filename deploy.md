Deploy guide — IA-medical (internal, Proxmox VM)

Overview
- This guide shows the minimal steps to deploy the app inside a Proxmox VM (Ubuntu 22.04). Internal-only: users access the app by VM IP or a local name (hosts file).

Assumptions
- You have SSH access to the VM as user `deploy` with sudo.
- Repo is on GitHub and/or available to clone.
- Database connection details (DATABASE_URL) are available.
- You will take a Proxmox snapshot before deploy.

Project-specific notes (read this once)
- Backend defaults are not production-safe. Update these via environment variables:
  - `DATABASE_URL` (do not use the default in `backend/app/core/config.py`)
  - `SECRET_KEY` (default is `change-this-secret-key`)
- Admin bootstrap script sets a default password (`admin123`) in `backend/scripts/setup_admin.py`. Change it after first login.
- The repo includes heavy ML dependencies (torch/transformers/ollama). Ensure the VM has enough disk/RAM, and verify Ollama is reachable if chat features are required.
- Web/mobile frontends expect an API base URL:
  - Web: `REACT_APP_API_URL` (example: `http://<VM-IP>/api`)
  - Mobile: `REACT_APP_API_URL` in `frontend/mobile/.env` for the device network

Quick checklist (do in order)
0. Pick a release
- Tag the commit you want to deploy and use that tag on the VM.
1. Snapshot the VM (safety)

```bash
# run on Proxmox host or use UI
qm snapshot <VMID> pre-deploy-$(date +%F-%H%M)
```

2. SSH to VM

```bash
ssh deploy@<VM-IP>
```

3. Update OS & install packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-venv python3-pip nginx git ufw postgresql-client
```

4. Firewall (basic)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp    # optional
sudo ufw enable
```

5. Place code, create venv, install deps

```bash
sudo mkdir -p /opt/ia-medical
sudo chown deploy:deploy /opt/ia-medical
cd /opt/ia-medical
git clone <REPO-URL> .
git checkout <release-tag>
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

6. Add production env (secrets)
- Create `/etc/ia-medical/env` containing lines KEY=VALUE (DATABASE_URL, SECRET_KEY, SMTP creds).
- Secure the file:
```bash
sudo mkdir -p /etc/ia-medical
sudo nano /etc/ia-medical/env   # paste secrets
sudo chown root:root /etc/ia-medical/env
sudo chmod 600 /etc/ia-medical/env
```

7. Backup DB (before migrations)

```bash
pg_dump -h <db-host> -U <db-user> -Fc <db-name> > /tmp/db-predeploy.dump
# copy the dump to a safe place off the VM
```

8. Run DB migrations

```bash
export $(grep -v '^#' /etc/ia-medical/env | xargs)
source /opt/ia-medical/backend/.venv/bin/activate
cd /opt/ia-medical/backend
alembic upgrade head
```

9. Create systemd service (run app)
- Create `/etc/systemd/system/ia-medical.service` with content below (edit paths/user):

```
[Unit]
Description=IA Medical backend
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

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ia-medical
sudo journalctl -u ia-medical -f
```

10. Nginx reverse proxy (so users use port 80)
- Create `/etc/nginx/sites-available/ia-medical` (server_name can be `rheuma.local`)

```nginx
server {
  listen 80;
  server_name rheuma.local;

  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ia-medical /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

11. Make clinic PCs reach the VM by name
- Edit each client hosts file and add:
```
<VM-IP>  rheuma.local
```
(Windows: edit `C:\Windows\System32\drivers\etc\hosts` as admin)

12. Smoke tests
- On VM:
```bash
curl -I http://127.0.0.1:8000/health
```
- From clinic PC (after hosts change):
```bash
curl -I http://rheuma.local/
```

13. Rollback (if needed)
- Preferred: restore Proxmox snapshot from pre-deploy.

```bash
# on Proxmox host
qm rollback <VMID> pre-deploy-YYYY-MM-DD-HHMM
```

- Or quick code rollback:
```bash
cd /opt/ia-medical
git checkout <previous-tag>
sudo systemctl restart ia-medical
```
- DB restore (if needed):
```bash
pg_restore -h <db-host> -U <db-user> -d <db-name> /path/db-predeploy.dump
```

Notes & tips
- Do not commit secrets to git. Keep `/etc/ia-medical/env` private.
- Keep the pre-deploy snapshot until you confirm stable operation.
- If you want HTTPS inside LAN without warnings, use `mkcert` to create locally trusted certs and configure Nginx to use them.
- If repo is private, use a deploy key or SSH remote for git clone.
- After deploy, change the admin password immediately and store it securely.
