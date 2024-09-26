FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
ARG SENTRY_ORG
ENV SENTRY_ORG=$SENTRY_ORG
ARG SENTRY_PROJECT
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=$SENTRY_RELEASE
RUN apt-get update
RUN apt-get -y install ca-certificates
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN pnpm install --frozen-lockfile
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
      SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
      export SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN && \
      pnpm --filter=app-builder run build
ENV NODE_ENV=production
RUN pnpm deploy --filter=app-builder --prod /prod/app-builder

FROM base AS app-builder
ENV NODE_ENV=production
ENV PORT=${PORT:-8080}
RUN apt-get update && apt-get install -y curl
COPY --from=build /prod/app-builder /prod/app-builder
WORKDIR /prod/app-builder
EXPOSE $PORT
CMD [ "pnpm", "start"]
