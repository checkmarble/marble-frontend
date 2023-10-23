FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=$SENTRY_RELEASE
RUN corepack enable
RUN apt-get update
RUN apt-get -y install ca-certificates
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile

FROM base AS build
RUN pnpm install --frozen-lockfile
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
      SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
      export SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN && \
      pnpm run -r build-with-sourcemaps --release $SENTRY_RELEASE

FROM base AS app-builder
ENV NODE_ENV=production
ENV PORT=8080

# To replace by above line when nested package.json are correctly setup
COPY --from=prod-deps /app/node_modules /app/node_modules
# COPY --from=prod-deps /app/packages/app-builder/node_modules/ /app/packages/app-builder/node_modules

COPY --from=build /app/packages/app-builder/build /app/packages/app-builder/build
COPY --from=build /app/packages/app-builder/public /app/packages/app-builder/public
WORKDIR /app/packages/app-builder
EXPOSE 8080
CMD [ "pnpm", "exec", "remix-serve", "build"]
