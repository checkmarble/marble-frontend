# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

From your terminal:

```sh
npx nx run builder:dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npx nx run builder:build
```

Then run the app in production mode:

```sh
npx nx run builder:start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

> There is a bunch of [packages](https://remix.run/docs/en/v1/api/remix) to help you deploy on your favorite platform
