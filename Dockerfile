FROM node:24-alpine as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install

COPY . ./

RUN pnpm build

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install --prod

COPY --from=builder /app/dist ./

CMD ["node", "dist/index.js"]