# Docker deploy — Centre Dentaire Bakraoui (AnyDesk / LAN)

Deploy DentAI on a Windows or Linux machine that already has **Docker** and **Ollama** with **`gemma4:latest`** installed.

Target example from your network: **`192.168.100.78`** (replace with the remote machine IP if different).

## What runs in Docker

| Service | Role |
|---------|------|
| `db` | MySQL 8, database `dentai` |
| `backend` | FastAPI API on port 8000 (internal) |
| `web` | Nginx + React build on port **80** (public) |

Ollama stays **on the host** (not in Docker). The backend reaches it via `host.docker.internal:11434`.

## 1. Prepare the remote machine (via AnyDesk)

### Ollama

```powershell
ollama list
```

You should see `gemma4:latest` (or another tag you intend to use). If not:

```powershell
ollama pull gemma4
```

Keep Ollama running (default: `http://localhost:11434`).

### Get the project

**Option A — Git (recommended)**

```powershell
git clone https://github.com/Ismailbak/cdbakraoui.git
cd cdbakraoui
```

**Option B — AnyDesk file transfer**

1. Zip the project folder on your dev PC.
2. Send it through AnyDesk to the remote machine.
3. Extract and `cd` into the folder.

## 2. Configure environment

```powershell
copy .env.docker.example .env
notepad .env
```

Set at minimum:

- `MYSQL_ROOT_PASSWORD` / `MYSQL_PASSWORD` — strong passwords
- `SECRET_KEY` — long random string
- `ADMIN_PASSWORD` — admin login password
- `CORS_ORIGINS` — include the remote IP, e.g. `http://192.168.100.78,http://localhost`
- `OLLAMA_MODEL=gemma4:latest` — must match `ollama list` exactly

## 3. Build and start

From the project root:

```powershell
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

First build can take **15–30+ minutes** (PyTorch in backend image). Wait until all containers are healthy:

```powershell
docker compose -f docker-compose.prod.yml ps
```

## 4. Database setup

### Fresh database

```powershell
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

Apply dental catalog SQL (if not already present):

```powershell
docker compose -f docker-compose.prod.yml exec -T db mysql -udentai -p%MYSQL_PASSWORD% dentai < backend/migrations/versions/007_restore_dental_form_catalog.sql
docker compose -f docker-compose.prod.yml exec -T db mysql -udentai -p%MYSQL_PASSWORD% dentai < backend/migrations/versions/008_cleanup_duplicate_dental_catalog.sql
docker compose -f docker-compose.prod.yml exec -T db mysql -udentai -p%MYSQL_PASSWORD% dentai < backend/migrations/versions/009_fix_prothese_utf8.sql
```

On PowerShell, replace `%MYSQL_PASSWORD%` with the value from `.env`, or run the imports from inside the db container.

### Copy existing `dentai` data from your dev PC

On **dev PC** (where data already works):

```powershell
mysqldump -u root -p dentai > dentai-backup.sql
```

Transfer `dentai-backup.sql` via AnyDesk, then on **remote**:

```powershell
docker compose -f docker-compose.prod.yml exec -T db mysql -udentai -pYOUR_PASSWORD dentai < dentai-backup.sql
```

## 5. Create admin user

```powershell
docker compose -f docker-compose.prod.yml exec -e ADMIN_PASSWORD=your-admin-password -e PYTHONPATH=/app backend python scripts/setup_admin.py
```

Default username: `admin@cdbakraoui.ma`

## 6. Smoke tests

On the remote machine:

```powershell
curl http://localhost/health
curl http://localhost:11434/api/tags
```

From another PC on the same LAN:

```text
http://192.168.100.78/
```

Login and open the AI chat to confirm `gemma4:latest` responds.

## 7. Firewall (Windows)

Allow inbound **TCP 80** so other clinic PCs can reach the app:

```powershell
New-NetFirewallRule -DisplayName "DentAI Web" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Chat unavailable | Check `ollama list`, ensure model name in `.env` matches exactly (`gemma4:latest`) |
| Backend cannot reach Ollama | Confirm Ollama is running; `OLLAMA_HOST=http://host.docker.internal:11434` |
| Blank page / API errors | Check `CORS_ORIGINS` includes the IP you use in the browser |
| Build fails / out of disk | Backend image is large (~2 GB+); free disk space and retry |
| Port 80 in use | Set `WEB_PORT=8080` in `.env` and open `http://192.168.100.78:8080` |

### Logs

```powershell
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f web
```

### Restart after `.env` changes

```powershell
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

### Stop

```powershell
docker compose -f docker-compose.prod.yml down
```

Data persists in Docker volumes `mysql_data` and `uploads_data`.

## Notes

- Do **not** commit `.env` to git.
- Dev `docker-compose.yml` (hot reload) is for local coding only; use `docker-compose.prod.yml` on the clinic machine.
- If the remote machine has no internet, build images once on a connected machine, then `docker save` / transfer / `docker load` — expect multi-GB image files.
