# Bowy — Project README

 **Short description**

Bowy is a live chat application (frontend + backend + MySQL DB).

---

## Prerequisites 🔧

- Docker Desktop (with WSL2 on Windows recommended)
- Docker Compose v2 (docker compose)
- Node.js (v16+ recommended) and npm/yarn (for local development)
- (Optional) MySQL client for direct DB access

---

## Quick start — Recommended (Docker Compose) 

From the project root (where `compose.yml` is):

1. Build and start everything (first time or to rebuild):

```bash
docker compose -f compose.yml up -d --build
```

2. Check services status:

```bash
docker compose -f compose.yml ps
```

3. View logs (all or a single service):

```bash
docker compose -f compose.yml logs -f
# or
docker compose -f compose.yml logs -f backend
```

4. Stop and remove containers (keep volumes):

```bash
docker compose -f compose.yml down
```

5. Stop and remove containers + volumes:

```bash
docker compose -f compose.yml down -v
```

---

## Services & ports (defaults) 

- Frontend: http://localhost:5173 (compose maps 5173 → 80)
- Backend API: http://localhost:3001
- MySQL DB: host `localhost:3306`

Default DB credentials (as in `compose.yml`):
- DB user: `bowy`
- DB password: `secret`
- Root password: `rootpassword`


---

## Run services locally (without Docker) — development

If you prefer to run services individually for development:

### Backend

```bash
cd packages/backend
npm install
# edit `config.json` or set environment variables if needed (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, PORT)
npm run dev
```

Notes: the backend listens on port 3001 by default (see `packages/backend/config.json`).

### Frontend

```bash
cd packages/frontend
npm install
npm run dev
```

The frontend uses Vite and runs on port 5173 by default.

---

## Database (DB image & publishing to Docker Hub) 

The `packages/db` folder contains a Dockerfile that extends `mysql:8.0` and copies `init.sql` to initialize the DB.

To publish a reusable DB image to Docker Hub:

1. (Optional but recommended) remove sensitive ENV lines from `packages/db/Dockerfile` so secrets are not baked into the image. Keep `COPY init.sql /docker-entrypoint-initdb.d/`.

2. Build & tag the image locally:

```bash
docker build -t <your-dockerhub-username>/bowy-db:1.0 packages/db
```

3. Test the image locally (provide runtime secrets during `docker run`):

```bash
docker run -d --name testdb -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=<rootpass> \
  -e MYSQL_DATABASE=bowy \
  -e MYSQL_USER=bowy \
  -e MYSQL_PASSWORD=secret \
  <your-dockerhub-username>/bowy-db:1.0
```

4. Push to Docker Hub:

```bash
docker login
docker push <your-dockerhub-username>/bowy-db:1.0
```

5. Update `compose.yml` to use the published image, e.g.:

```yaml
db:
  image: <your-dockerhub-username>/bowy-db:1.0
  environment:
    MYSQL_DATABASE: bowy
    MYSQL_USER: bowy
    MYSQL_PASSWORD: secret
    MYSQL_ROOT_PASSWORD: rootpassword
  volumes:
    - db-data:/var/lib/mysql
  ports:
    - "3306:3306"
```

You can also set up automated builds in Docker Hub (or use GitHub Actions) to push on new commits/tags.

---

## Known issues / UX notes ⚠️

- **Registration flow:** User registration works server-side (accounts are created), but the UI does not automatically log you in or redirect to the chat after registering. Workaround: after clicking **Register**, return to the **Login** screen and sign in with your new credentials.

---

## Troubleshooting

- If a service fails to start, check its logs:
  - `docker compose -f compose.yml logs -f backend`
  - `docker compose -f compose.yml logs -f db`

- If ports are already in use: change the host mapping in `compose.yml` (left side of the port mapping).

- If DB does not initialize: inspect `packages/db/init.sql` and `docker compose -f compose.yml logs -f db` for errors.
