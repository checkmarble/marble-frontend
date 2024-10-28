FROM node:22-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

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
      export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
      pnpm --filter=app-builder run build
ENV NODE_ENV=production
RUN pnpm --filter=app-builder --prod deploy /prod/app-builder

FROM gcr.io/distroless/nodejs22-debian12 AS app-builder
ENV NODE_ENV=production
ENV PORT=${PORT:-8080}
COPY --from=build /prod/app-builder/node_modules /prod/app-builder/node_modules
COPY --from=build /prod/app-builder/build /prod/app-builder/build
WORKDIR /prod/app-builder
USER nonroot
EXPOSE $PORT
CMD ["./node_modules/@remix-run/serve/dist/cli.js", "./build/server/index.js"]
