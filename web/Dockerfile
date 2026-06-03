# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci

FROM deps AS development
ENV NODE_ENV=development

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

FROM deps AS build
ENV NODE_ENV=production
ARG API_URL=http://api:3001
ARG API_PUBLIC_URL=http://localhost:3001
ENV API_URL=${API_URL}
ENV API_PUBLIC_URL=${API_PUBLIC_URL}

COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ARG API_URL=http://api:3001
ARG API_PUBLIC_URL=http://localhost:3001
ENV API_URL=${API_URL}
ENV API_PUBLIC_URL=${API_PUBLIC_URL}

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
