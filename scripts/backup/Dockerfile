FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client tzdata > /dev/null

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY scripts ./scripts
COPY src ./src

ENTRYPOINT ["sh", "scripts/backup/entrypoint.sh"]
