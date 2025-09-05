# Marble Frontend Monorepo

This is the frontend marble monorepo. We use `bun` as the package manager and keep Node.js for runtime.

## Getting started

This README is a global README for the monorepo. Each package may have its own README. You can find them in the `packages/*/README.md` files.

> **Disclaimer**
>
> This repository’s README file is intended for internal use by our development team. The documentation provided here is specifically designed for setting up and running the project on macOS.
>
> While external contributions and interest are appreciated, please note that we do not officially support setups on other operating systems. If you encounter issues outside of the macOS environment, support may be limited.
>
> For general documentation and user-facing guides, please refer to our main repository: [Marble Documentation](https://github.com/checkmarble/marble/blob/main/README.md).

### Installations

#### Install Bun

[Install mise-en-place](https://mise.jdx.dev/getting-started.html) or alternatively install Bun independently

```bash
curl -fsSL https://bun.sh/install | bash
```

To enable shell autocompletion, see `bun completion --help`.

#### Install dependencies

```bash
bun install
```

##### (VSCode) Install recommended VSCode extensions

There is a recommended extensions list in the `.vscode/extensions.json` file.

All required configuration settings are already included inside the `.vscode/settings.json` file.
Recommended settings are in the `.vscode/.user-settings.sample.json` file. Cherry-pick them to your user config file.

### Launch

All packages are located in the `packages` folder. To work in a package, you can use Bun's workspace `--filter` to trigger scripts in `packages/*/package.json`. Example to start the app builder in dev mode:

> **Before first launch.**
>
> Follow the [app-builder package README](packages/app-builder/README.md) to setup its env file.

```bash
# This will run the dev script in the ./packages/app-builder/package.json
bun run -F app-builder dev
```

> We use Bun workspaces. More information:
>
> - [run](https://bun.com/docs/cli/run)
> - [install](https://bun.com/docs/cli/install)

#### Some usefull commands

```bash
# Start the builder app in dev mode
bun run -F app-builder dev

# Generate the marble-api client
bun run -F marble-api generate-api

# Start the storybook in dev mode
bun run -F ui-design-system storybook

# Generate icons from svg files
bun run -F ui-icons generate-icons
```

#### (VSCode) Use launch configuration

When available, you can use VSCode launch configuration to run the package scripts. You can find them in the `.vscode/launch.json` file.

### Developpement

#### How to check the code locally like the CI

```bash
bun run -F "*" type-check && bun x biome check
```
