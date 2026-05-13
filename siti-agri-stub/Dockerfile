# Siti Agri Stub Dockerfile — simple Hapi.js server (no Webpack).
#
# This stub represents three pieces of SitiAgri infrastructure:
# 1. capd-externaldb-facade API (GET /embedded-screens/params/{frn})
# 2. SSO Bridge (/sso-bridge/actions/sso-bridge/ssoBridge)
# 3. Siti Agri UI (the embedded screen HTML)
#
# In production, these are separate Java-based services running on
# different servers. Here they're combined into one Node.js service
# for simplicity.

ARG PARENT_VERSION=2.10.0-node24.11.1
ARG PORT=3002

FROM defradigital/node-development:${PARENT_VERSION} AS development
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}

ENV TZ="Europe/London"

ARG PORT
ENV PORT=${PORT}
EXPOSE ${PORT}

# Curl used for Docker healthchecks
USER root
RUN apk add --no-cache curl
USER node

COPY --chown=node:node --chmod=755 package*.json ./
RUN npm install
COPY --chown=node:node --chmod=755 . .

CMD [ "npm", "run", "dev" ]

FROM development AS production

ENV NODE_ENV=production

RUN npm ci --omit=dev

CMD [ "npm", "start" ]
