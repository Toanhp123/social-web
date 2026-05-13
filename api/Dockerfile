# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
ENV NODE_ENV=development
ENV DATABASE_URL=postgresql://social_web:social_web@postgres:5432/social_web?schema=public

RUN mkdir -p src
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

FROM deps AS development
ENV NODE_ENV=development

COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM deps AS build
ENV NODE_ENV=production

COPY nest-cli.json tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM base AS production-deps
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts \
  && npm cache clean --force

FROM base AS production
ENV NODE_ENV=production

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

EXPOSE 3001
CMD ["node", "dist/src/main.js"]
