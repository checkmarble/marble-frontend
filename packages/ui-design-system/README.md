# ui-design-system

This library regroup the Marble design system implementation.

## Develop

To develop locally, lauch the Storybook :

```sh
pnpm --filter ui-design-system run storybook
```

You can start editing / add components in isolation

### Add a new component

1. Create a folder following the convention (look at existing components)

2. Create a story and visualize it in Storybook

3. Iterate on the component until it's ready (don't forget to add tests)

4. Export your component in `src/index.ts`
