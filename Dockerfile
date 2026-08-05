FROM node:24-alpine AS base

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable

RUN pnpm install

COPY . .

# --- Development Stage ---
FROM base AS development

ENV NODE_ENV=development

# Hot-reloading script
CMD ["pnpm", "run", "dev"]

# --- Testing Stage ---
FROM base AS test

ENV NODE_ENV=test

# Testing script
CMD ["pnpm", "run", "test"]

# --- Builder Stage (Compiles TypeScript/Code for Prod) ---
FROM base AS builder

RUN pnpm build

# -----------------------------

FROM node:24-alpine

WORKDIR /app

COPY --from=base /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

RUN corepack enable

RUN pnpm install --prod

COPY --from=base /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]