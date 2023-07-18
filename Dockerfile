FROM node:20-slim AS base

RUN corepack enable
RUN pnpm config set store-dir ~/pnpm-store
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/root/pnpm-store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/root/pnpm-store pnpm install --frozen-lockfile
RUN pnpm run -r build

FROM base AS app-builder
ENV NODE_ENV=production
ENV PORT=8080

# To replace by above commented line when nested package.json are correctly setup
COPY --from=prod-deps /app/node_modules /app/node_modules
# COPY --from=prod-deps /app/packages/app-builder/node_modules/ /app/packages/app-builder/node_modules

COPY --from=build /app/packages/app-builder/build /app/packages/app-builder/build
COPY --from=build /app/packages/app-builder/public /app/packages/app-builder/public
WORKDIR /app/packages/app-builder
EXPOSE 8080
CMD [ "pnpm", "exec", "remix-serve", "build"]

