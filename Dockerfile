FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
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
      pnpm run -r build-with-sourcemaps --release $SENTRY_RELEASE
RUN pnpm deploy --filter=app-builder --prod /prod/app-builder

FROM base AS app-builder
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=build /prod/app-builder /prod/app-builder
WORKDIR /prod/app-builder
EXPOSE 8080
CMD [ "pnpm", "start"]
