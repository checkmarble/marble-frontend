ARG BUN_IMAGE=oven/bun:1.3
ARG RUNTIME_IMAGE=gcr.io/distroless/nodejs22-debian12:nonroot
# ---- Dependencies stage ----
FROM ${BUN_IMAGE} AS deps-dev
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
COPY packages/tests/package.json ./packages/tests/

# Install WITH dev dependencies (needed for build stage)
RUN --mount=type=cache,target=/root/.bun \
    bun ci

# ---- Build stage ---- (uses dev deps from above)
FROM ${BUN_IMAGE} AS build
WORKDIR /usr/src/app

# Copy full source AFTER deps to leverage layer caching
COPY . .
# Reuse cached node_modules from deps stage
COPY --from=deps-dev /usr/src/app/node_modules ./node_modules
COPY --from=deps-dev /usr/src/app/packages/app-builder/node_modules ./packages/app-builder/node_modules
COPY --from=deps-dev /usr/src/app/packages/marble-api/node_modules ./packages/marble-api/node_modules
COPY --from=deps-dev /usr/src/app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps-dev /usr/src/app/packages/tailwind-preset/node_modules ./packages/tailwind-preset/node_modules
COPY --from=deps-dev /usr/src/app/packages/typescript-utils/node_modules ./packages/typescript-utils/node_modules
COPY --from=deps-dev /usr/src/app/packages/ui-design-system/node_modules ./packages/ui-design-system/node_modules
COPY --from=deps-dev /usr/src/app/packages/ui-icons/node_modules ./packages/ui-icons/node_modules

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
    cp -R packages/app-builder/.output /prod/app-builder/.output

# ---- Production Dependencies stage ----
FROM ${BUN_IMAGE} AS deps-prod
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
COPY packages/tests/package.json ./packages/tests/

# Install ONLY production dependencies
RUN --mount=type=cache,target=/root/.bun \
    bun install --production --frozen-lockfile

# ---- Runtime stage ---- (uses prod deps)
FROM ${BUN_IMAGE} AS app-builder
WORKDIR /prod/app-builder

ENV NODE_ENV=development
ARG PORT=8080
ENV PORT=${PORT:-8080}

ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION

ARG SEGMENT_WRITE_KEY_OPENSOURCE=""
ARG SEGMENT_WRITE_KEY=""
ENV SEGMENT_WRITE_KEY=${SEGMENT_WRITE_KEY_OPENSOURCE:-""}

# Copy build output
COPY --from=build /usr/src/app/packages/app-builder/.output ./.output

# Copy ONLY production dependencies
COPY --from=deps-prod /usr/src/app/node_modules ./node_modules

EXPOSE $PORT
CMD ["bun", ".output/server/index.mjs"]
