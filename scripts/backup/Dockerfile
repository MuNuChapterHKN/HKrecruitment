FROM postgres:18-alpine

RUN apk add --no-cache rclone

COPY entrypoint.sh /entrypoint.sh
COPY run.sh /usr/local/bin/run.sh

RUN chmod +x /entrypoint.sh /usr/local/bin/run.sh

ENTRYPOINT ["/entrypoint.sh"]
