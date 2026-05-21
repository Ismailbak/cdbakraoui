# Repository Cleanup Inventory

Conservative cleanup pass (May 2026). **No docs/assets/presentations were removed.**

## Safe to delete locally (regenerated / ignored)

| Path | Reason |
|------|--------|
| `**/__pycache__/` | Python bytecode cache |
| `**/*.pyc` | Compiled Python |
| `backend/.pytest_cache/` | Pytest cache |
| `frontend/web/build/` | CRA production build output |
| `frontend/web/node_modules/.cache/` | Webpack/babel cache |
| `frontend/mobile/.expo/` | Expo dev cache |
| `*.log` | Runtime logs |

These are listed in [`.gitignore`](../.gitignore). Delete locally anytime; they should not be committed.

## Review later (do not delete without confirmation)

| Path | Notes |
|------|--------|
| `file.md` | Hand-maintained inventory; paths partly stale vs current `backend/app/*` layout |
| `SYSTEM.md` | Long reference; verify against current code before operational use |
| `frontend/web/src/pages/Appointments/AppointmentList.js` | Not imported by router; may be dead code |
| `frontend/web/src/pages/MedicalActs/MedicalActList.js` | Not imported by router; may be dead code |
| `frontend/web/src/assets/images/*-removebg-preview.png` | Marketing/tech logos; unused in active routes |
| `backend/data/uploads/profiles/user_7.png` | Runtime upload; was tracked in git — untrack, keep on disk |
| `backend/tests/test_rag_*.py` | Imports and mocks updated May 2026; re-run `pytest tests/` after RAG changes |

## Keep (active application code)

| Area | Location |
|------|----------|
| Backend API | `backend/app/{auth,patients,chat,...}/` |
| RAG pipeline | `backend/app/chat/rag/` |
| Web app | `frontend/web/src/pages/`, `frontend/web/src/components/` |
| Mobile app | `frontend/mobile/src/screens/`, `frontend/mobile/src/components/common/` |
| Deploy guide | [`deploy.md`](../deploy.md) |
| Local env files | `.env` files stay local and ignored by git |

## Fixes applied in this pass

- [`docker-compose.yml`](../docker-compose.yml): `frontend-web` → `frontend/web`
- RAG tests: imports `app.services.*` → `app.chat.rag.retrievers.*`
- [`.gitignore`](../.gitignore): pytest cache, web build, backend uploads
- Component barrels: web/mobile `components/common/index.js` exports aligned with existing files

## Canonical docs (recommended, not moved in safe pass)

| Purpose | File |
|---------|------|
| Entry | `README.md` |
| Production deploy | `deploy.md` |
| Deep system reference | `SYSTEM.md` |
| RAG design | `RAG.md` |
