# Docker

This setup runs the web app, backend API, and a local PostgreSQL database.

## Development

From the repository root:

```sh
docker compose up --build
```

Web:

```txt
http://localhost:3000
```

API:

```txt
http://localhost:3001
```

PostgreSQL:

```txt
localhost:5432
database: social_web
user: social_web
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

## Seed

```sh
docker compose exec api npm run seed
```

Optional seed variables:

```sh
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin123
SEED_ADMIN_FULL_NAME="Admin User"
SEED_ADMIN_USERNAME=admin
```

## Stop

```sh
docker compose down
```

To remove the local database volume:

```sh
docker compose down -v
```

`docker compose down -v` deletes local Docker database data.
