FROM oven/bun:alpine AS build
ENV PATH="/root/.bun/bin:$PATH"

ARG SENTRY_ORG
ENV SENTRY_ORG=$SENTRY_ORG
ARG SENTRY_PROJECT
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=$SENTRY_RELEASE

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN bun install --frozen-lockfile
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
      export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
      bun run -F app-builder build
ENV NODE_ENV=production
RUN mkdir -p /prod/app-builder && \
    cp -R packages/app-builder/build /prod/app-builder/build && \
    cp -R -L node_modules /prod/app-builder/node_modules

FROM gcr.io/distroless/nodejs22-debian12 AS app-builder
ENV NODE_ENV=production
ENV PORT=${PORT:-8080}
ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION
ARG SEGMENT_WRITE_KEY=""
ENV SEGMENT_WRITE_KEY=${SEGMENT_WRITE_KEY_OPENSOURCE:-""}
COPY --from=build /prod/app-builder/node_modules /prod/app-builder/node_modules
COPY --from=build /prod/app-builder/build /prod/app-builder/build
WORKDIR /prod/app-builder
USER nonroot
EXPOSE $PORT
CMD ["./node_modules/@remix-run/serve/dist/cli.js", "./build/server/index.js"]
