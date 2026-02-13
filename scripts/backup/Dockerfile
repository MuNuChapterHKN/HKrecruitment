FROM postgres:18-alpine

RUN apk add --no-cache rclone

COPY entrypoint.sh /entrypoint.sh
COPY run.sh /usr/local/bin/run.sh

RUN chmod +x /entrypoint.sh /usr/local/bin/run.sh

ENTRYPOINT ["/entrypoint.sh"]

FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client tzdata > /dev/null

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY scripts ./scripts
COPY src ./src

ENTRYPOINT ["sh", "scripts/backup/entrypoint.sh"]
