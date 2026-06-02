# Docker

This repository has separate Docker flows for local development and production-like deployment.

## Development

Development uses `docker-compose.yml`.

```sh
docker compose up --build
```

Services:

```txt
web:      http://localhost:3000
api:      http://localhost:3001
postgres: localhost:5432
```

PostgreSQL:

```txt
database: social_web
user:     social_web
password: social_web
```

The API container runs:

```sh
npm run generate
npx prisma migrate deploy
npm run dev
```

The web container runs:

```sh
npm run dev -- --hostname 0.0.0.0
```

Inside Docker, the web app calls the API through:

```txt
API_URL=http://api:3001
```

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
migrate:  runs npx prisma migrate deploy before api starts
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
docker compose exec api npm run seed
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

To remove local database volumes:

```sh
docker compose down -v
docker compose --env-file .env.production -f docker-compose.prod.yml down -v
```

`down -v` deletes Docker database data.
