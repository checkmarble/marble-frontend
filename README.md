# Marble Frontend Monorepo

This is the frontend marble monorepo. We use `pnpm` to handle dependancies.

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

#### Install pnpm

[Install mise-en-place](https://mise.jdx.dev/getting-started.html) or alternatively install pnpm independently

```bash
brew install pnpm
```

> NB: more installation options [here](https://pnpm.io/installation)

To enable shell autocompletion, run:
(Bash)

```bash
pnpm completion bash > ~/completion-for-pnpm.bash
echo 'source ~/completion-for-pnpm.bash' >> ~/.bashrc

```

(zsh)

```bash
pnpm completion zsh > ~/completion-for-pnpm.zsh
echo 'source ~/completion-for-pnpm.zsh' >> ~/.zshrc
```

(Fish)

```bash
pnpm completion fish > ~/.config/fish/completions/pnpm.fish
```

More info at https://pnpm.io/completion

#### Install dependencies

```bash
pnpm install
```

##### (VSCode) Install recommended VSCode extensions

There is a recommended extensions list in the `.vscode/extensions.json` file.

All required configuration settings are already included inside the `.vscode/settings.json` file.

### Launch

 All packages are located in the `packages` folder. To work in a package, you can use the `--filter` option of `pnpm` to trigger the dedicated scripts present in each `packages/*/package.json`. Example to start the app builder in dev mode:

> **Before first launch.**
>
> Follow the [app-builder package README](packages/app-builder/README.md) to setup its env file.

```bash
# This will run the dev script in the ./packages/app-builder/package.json
pnpm --filter app-builder run dev
```

> We use `pnpm` monorepo capabilities. More informations :
>
> - [filtering](https://pnpm.io/filtering)
> - [workspace](https://pnpm.io/workspaces)

#### Some usefull commands

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

#### (VSCode) Use launch configuration

When available, you can use VSCode launch configuration to run the package scripts. You can find them in the `.vscode/launch.json` file.

### Developpement

#### How to check the code locally like the CI

```bash
pnpm run -r type-check && pnpm run -r lint && pnpm run format:check
```
