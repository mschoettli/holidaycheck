FROM node:22-alpine

ARG HOLIDAYCHECK_BUILD_REVISION=local
ENV NODE_ENV=production
ENV HOLIDAYCHECK_BUILD_REVISION=${HOLIDAYCHECK_BUILD_REVISION}
WORKDIR /app

COPY package.json server.js ./
COPY public ./public

RUN mkdir -p /app/data && chown -R node:node /app/data

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
