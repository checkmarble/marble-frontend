# ---- Build stage ----
    FROM oven/bun:alpine AS deps-dev
    WORKDIR /usr/src/app

    # Copy only workspace manifests to maximize install cache hits
    COPY package.json bun.lock ./
    COPY packages/app-builder/package.json ./packages/app-builder/
    COPY packages/shared/package.json ./packages/shared/
    COPY packages/marble-api/package.json ./packages/marble-api/
    COPY packages/typescript-utils/package.json ./packages/typescript-utils/
    COPY packages/ui-design-system/package.json ./packages/ui-design-system/
    COPY packages/ui-icons/package.json ./packages/ui-icons/
    COPY packages/tailwind-preset/package.json ./packages/tailwind-preset/

    # Avoid frozen lockfile errors in CI and install dev deps for build tooling
    ENV BUN_INSTALL_FROZEN_LOCKFILE=0
    # Install with dev dependencies for build tooling (cache modules between builds)
    RUN --mount=type=cache,target=/root/.bun \
        bun install

    
    FROM oven/bun:alpine AS build
    WORKDIR /usr/src/app

    # Copy full source AFTER deps to leverage layer caching
    COPY . .
    # Reuse cached node_modules from deps stage
    COPY --from=deps-dev /usr/src/app/node_modules ./node_modules

    # Build-time configuration
    ARG SENTRY_ORG
    ENV SENTRY_ORG=$SENTRY_ORG
    ARG SENTRY_PROJECT
    ENV SENTRY_PROJECT=$SENTRY_PROJECT
    ARG SENTRY_RELEASE
    ENV SENTRY_RELEASE=$SENTRY_RELEASE

    # Use BuildKit secret for SENTRY token if available
    RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
        export VITE_CJS_IGNORE_WARNING=1; \
        if [ -f /run/secrets/SENTRY_AUTH_TOKEN ]; then export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN); fi; \
        bun run -F app-builder build

    # Collect build artifacts and dependencies for runtime
    RUN mkdir -p /prod/app-builder && \
        cp -R packages/app-builder/build /prod/app-builder/build && \
        cp -R -L node_modules /prod/app-builder/node_modules


    # ---- Runtime stage ----
    FROM gcr.io/distroless/nodejs22-debian12:nonroot AS app-builder
    WORKDIR /prod/app-builder

    ENV NODE_ENV=production
    ARG PORT=8080
    ENV PORT=$PORT

    # Copy dependencies and build output from build stage
    COPY --from=build /prod/app-builder/node_modules ./node_modules
    COPY --from=build /prod/app-builder/build ./build

    EXPOSE $PORT

    CMD ["./node_modules/@remix-run/serve/dist/cli.js", "./build/server/index.js"]