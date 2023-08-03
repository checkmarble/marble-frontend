# Marble Front Monorepo

This is the frontend marble monorepo. We use `pnpm` to handle dependancies.

## Getting started

This README is a global README for the monorepo. Each package may have its own README. You can find them in the `packages/*/README.md` files.

### Install pnpm

```bash
brew install pnpm
```

> NB: more installation options [here](https://pnpm.io/installation)

To enable shell autocompletion (works for bash, zsh and fish), run:

```bash
pnpm install-completion
```

### Install dependancies

```bash
pnpm install
```

#### (VSCode) Install recommended VSCode extensions

There is a recommended extensions list in the `.vscode/extensions.json` file.

You can read README pages in the extension marketplace for each extensions.
**TL;DR: you should add those settings to your (global/workspace) VSCode settings:**

```json
"editor.codeActionsOnSave": {
    "source.fixAll": true
  },

"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
```

### Work in a package

Each packages are located in the `packages` folder. To work in a package, you can use the `--filter` option of `pnpm` to trigger the dedicated scripts present in each `packages/*/package.json`. Exemple to start the app builder in dev mode:

```bash
# This will run the dev script in the ./packages/app-builder/package.json
pnpm --filter app-builder run dev
```

### Some usefull commands

```bash
# Start the builder app in dev mode
pnpm --filter app-builder run dev

# Generate the marble-api client
pnpm --filter marble-api run generate-api

# Start the storybook in dev mode
pnpm --filter ui-design-system run storybook

# Generate icons from svg files
pnpm --filter ui-icons run generate-icons
```

### How to check the code locally like the CI

```bash
pnpm run -r type-check && pnpm run -r lint && pnpm run format:check
```
