# Marble Front Monorepo

This is the frontend marble monorepo. We use `npm` to handle dependancies and `nx` as build system tool.

## Getting started

We recommand you look at [Nx](https://nx.dev/) documentation. For information, most of this monorepo follow the "Integrated Repo" philosophy.

For VS Code users, we higlhy recommand the [official extension](https://nx.dev/core-features/integrate-with-editors#vscode-plugin:-nx-console). It will bring some UI on top of nx consol. It is based on the introspection of the monrepo `project.json` and `package.json` files, and thus can help you inspect/lauch all the targets of each projects.

> There is also some community extensions for WebStorm and Neovim

## Environment variables in Nx

Nx task runner comes with [a built in opinionated way to handle env variables](https://nx.dev/recipes/environment-variables/define-environment-variables)
