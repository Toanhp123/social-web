# Docker

This repository has separate Docker flows for local development and production-like deployment.

## Development

Development uses `docker-compose.yml` for local infrastructure.

```sh
docker compose up -d
```

Create local env files for the apps:

```sh
cp api/.env.example api/.env
cp web/.env.example web/.env.local
```

Services:

```txt
postgres: localhost:5432
redis:    localhost:6379
```

PostgreSQL:

```txt
database: social_web
user:     social_web
password: social_web
```

Redis:

```txt
url: redis://localhost:6379
```

Run the API and web app from their project folders during development.

## Production

Production uses `docker-compose.prod.yml`.

Create an env file from the example and replace every `change-this-*` value:

```sh
cp .env.production.example .env.production
```

Run the production stack:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

Production behavior:

```txt
web:      exposed through WEB_PORT, default 3000
api:      internal only, exposed to web as http://api:3001
postgres: internal only
redis:    internal only, protected by REDIS_PASSWORD
migrate:  runs npx prisma migrate deploy before api starts
```

The production API receives:

```txt
REDIS_URL=redis://:<REDIS_PASSWORD>@redis:6379
```

The production API image runs:

```sh
node dist/src/main.js
```

The production web image runs Next.js standalone output:

```sh
node server.js
```

## Seed

Development:

```sh
cd api
npm run seed
```

Production:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm migrate npm run seed
```

Optional seed variables:

```sh
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin123
SEED_ADMIN_FULL_NAME="Admin User"
SEED_ADMIN_USERNAME=admin
```

## Stop

Development:

```sh
docker compose down
```

Production:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

To remove local database and cache volumes:

```sh
docker compose down -v
docker compose --env-file .env.production -f docker-compose.prod.yml down -v
```

`down -v` deletes Docker database and Redis data.
