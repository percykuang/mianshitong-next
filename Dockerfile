# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22.12.0
ARG PNPM_VERSION=10.18.2

FROM node:${NODE_VERSION}-bookworm-slim AS os-base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /repo

FROM os-base AS base
RUN npm i -g pnpm@${PNPM_VERSION}

FROM base AS deps
ENV HUSKY=0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json tsconfig.client.json tsconfig.server.json ./
COPY commitlint.config.mjs cspell.json eslint.config.mjs stylelint.config.mjs ./
COPY .prettierrc.json .prettierignore .stylelintignore ./
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/hooks/package.json packages/hooks/package.json
COPY packages/icons/package.json packages/icons/package.json
COPY packages/llm/package.json packages/llm/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/tokens/package.json packages/tokens/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS builder
ARG APP=web
ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build?schema=public
COPY . .
RUN mkdir -p apps/${APP}/public && pnpm db:generate && pnpm --filter @mianshitong/${APP} build

FROM deps AS migrator
ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build?schema=public
COPY . .
RUN pnpm db:generate
CMD ["pnpm", "--filter", "@mianshitong/db", "exec", "prisma", "migrate", "deploy"]

FROM os-base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ARG APP=web
ENV APP=$APP

COPY --from=builder /repo/apps/${APP}/.next/standalone ./
COPY --from=builder /repo/apps/${APP}/public ./apps/${APP}/public
COPY --from=builder /repo/apps/${APP}/.next/static ./apps/${APP}/.next/static

EXPOSE 3000
CMD ["sh", "-c", "node apps/$APP/server.js"]
