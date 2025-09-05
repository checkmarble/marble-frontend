#!/bin/bash

# Get the routes from the Remix CLI
routes_json=$(bunx remix routes --json)

# Write the routes to the file
echo "export const routes = $routes_json as const;" > src/utils/routes/routes.ts


