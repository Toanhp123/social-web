# Docker

This setup runs the backend API with a local PostgreSQL database.

## Development

From the repository root:

```sh
docker compose up --build
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
