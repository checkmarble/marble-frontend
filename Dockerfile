FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build

FROM base AS app-builder
ENV NODE_ENV=production
ENV PORT=8080

# To remove when nested package.json are correctly setup
COPY --from=prod-deps /app/node_modules /app/node_modules

COPY --from=prod-deps /app/packages/app-builder/node_modules/ /app/packages/app-builder/node_modules
COPY --from=build /app/packages/app-builder/build /app/packages/app-builder/build
COPY --from=build /app/packages/app-builder/public /app/packages/app-builder/public
WORKDIR /app/packages/app-builder
EXPOSE 8080
CMD [ "pnpm", "exec", "remix-serve", "build"]

