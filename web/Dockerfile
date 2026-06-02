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
ENV API_URL=${API_URL}

COPY . .
RUN npm run build

FROM base AS production-deps
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force

FROM base AS production
ENV NODE_ENV=production
ARG API_URL=http://api:3001
ENV API_URL=${API_URL}

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/package*.json ./

EXPOSE 3000
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]
