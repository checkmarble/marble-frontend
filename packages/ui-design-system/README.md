# ui-design-system

This library regroup the Marble design system implementation.

## Develop

To develop locally, lauch the Storybook :

```sh
npx nx run ui-design-system:storybook
```

You can start editing / add components in isolation

### Add component using generator

1. Use the nx generator as described above, and fill the form

![generate-component](./docs/generate-component.png)

2. It will create folder + files with skeleton to help you go faster

> You may need to adapt certain part to comply with other components convention

4. Add a story file

> If you want, you can use the generator @nx/react:component-story, or duplicate an existing story file
