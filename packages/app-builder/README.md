# App builder

This is the app builder package, it contains the main application code.

## Getting started

The application is built using the Remix framework. You can find the documentation [here](https://remix.run/).

### Development

#### Run the project

1. Create you own `.env` file based on `.env.example`.

> You can fill it with your own values but it should work locally with the default values.

2. launch the app in dev mode

   2.1. **VSCode users:** we recommand to use the launch task: "Launch app-builder" to start the app in dev mode. The debugger should be automatically attached (work for both SSR and client parts).

   2.2. **CLI users:** you can use the following command to start the app in dev mode:

   ```bash
   # Start the builder app in dev mode
   pnpm --filter app-builder run dev
   ```

#### Add a new route

The app uses the [flat routes convention](https://github.com/kiliman/remix-flat-routes?tab=readme-ov-file#remix-v2-flat-routes-convention) to define routes. You can find the routes in `src/routes/`.

When adding a new route you need to run :

```bash
pnpm --filter app-builder run generate-routes
```

This script help you generate a type-safe `getRoute` function that you can use to navigate between routes in the app.

#### Add a new component

If the component is specific to a route, most of the time you need to create it directly in the same file.

If the component is part of the marble design system, you need to create it inside `ui-design-system` package. If not, you can create it inside the `app-builder` package. Two possibilities here :

1. The component is mostly "presentationnal" (not connected to external data source needing loaders/actions): create the new component inside `src/components/*`.

2. The component is considered a [full-stack componente](https://www.epicweb.dev/full-stack-components) (connected to external data source needing loaders/actions): create the new component inside `src/routes/ressources+/*`.

> NB: in both cases, look at existing components to see how to structure your component and/or help you decide what feats your needs.

#### Add a new endpoints

You may need to update the marble-api client. To do so, look at the marble-api package README.

Then, it depends on the use case. For simple cases, you can directly consume the endpoint in a loader/action using the `apiClient` returned by the authenticator like so:

```typescript
const { apiClient } = await authenticator.isAuthenticated(request, {
  failureRedirect: getRoute('/sign-in'),
});

const decisions = await apiClient.listDecisions();
```

For more complex cases, you may need to create adapters/use cases using the `models/` `repositoris/` `services/` folders. Look at existing ones to see how to structure your code and/or help you decide what feats your needs.
