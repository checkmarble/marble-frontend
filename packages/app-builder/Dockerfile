# base node image
FROM node as base

# Install all node_modules, including dev dependencies
FROM base as deps
RUN mkdir /app
WORKDIR /app

ADD package.json package-lock.json ./
RUN npm install --production=false

# Setup production node_modules
FROM base as production-deps
RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

# Build the app
FROM base as build
ENV NODE_ENV=production
RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN npm run build -w app-builder

# Finally, build the production image with minimal footprint
FROM node:20-alpine
ENV NODE_ENV=production
ENV PORT=8080
RUN mkdir /app
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/packages/app-builder/build /app/build
COPY --from=build /app/packages/app-builder/public /app/public

# Expose the container port to the OS
EXPOSE 8080

CMD ["npx", "remix-serve", "build"]