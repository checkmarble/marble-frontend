# @ui-icons

This package contains all the icons used in the UI. This generate svg sprites a React component for each svg icon.

We create two types of svg sprites:

- `icons-svg-sprite`: monocolored svg that can be colored
- `logo-svg-sprite`: multicolored svg that won't be colored

## Check the available icons

I personally use `developer2006.svg-gallery` extension in VSCode to quickly check the available icons. The main advantage is that you can open the `svg/icons` folder and see all the icons at once (basically a mini icon gallery, and what you really need when looking for an possibly existing icon).

## Add a new asset

1. Get an svg export of your asset :

   a. If possible, prefer to export the svg directly from [Material Symbols & Icons](https://fonts.google.com/icons?icon.query=database&icon.set=Material+Symbols) as Figma tends to add some unnecessary groups, masks, etc.

   b. If you need to export from Figma, ensure you select the Icon + Slice that makes sense (= with the proper width & height) like in the above picture

![extract-svg-figma](./docs/extract-svg-figma.png)

2. Add the extracted svg in `/svgs`
   - if this is a new icon, add it in `/svgs/icons` (= monocolored svg that can be colored)
   - if this is a new logo, add it in `/svgs/logos` (= multicolored svg that won't be colored)

> Favour kebab-case file name & keep the exported name from the source to make it easier to find already imported assets.

1. Run `bun -F ui-icons generate-icons`

2. Commit your changes

## Integration

### React

1. Install the package
2. Ensure svg sprites are bundled/loaded in your app

   a. Storybook bundled them automatically

   b. For Remix, you need to explicitly load them (look at `packages/app-builder/src/root.tsx` for an example)

3. Use the `Icon`/`Logo` component (depending on the type of svg sprite you want to use)

   ```tsx
   import { Icon } from 'ui-icons';

   const MyComponent = () => <Icon icon="plus" className="size-6" />;
   ```

## Troubleshooting

### My icon is not displayed

- In dev, open the frontend in a new tab (issue with Chromium cache)
- Ensure the icon is correctly imported in the svg sprite (check the generated file with git diff)

### My icon is not colored

- Ensure you use the `Icon` component (not the `Logo` one)
- Ensure the generated svg sprite is using the `currentColor` css property for the fill
  - If not, you can manually update the svg fill attribute to #000000 (or any color already used in other working svgs) and re-run `bun -F ui-icons generate-icons`

### My icon is compressed/shrinked

- Try to use the `shrink-0` class on the `Icon` component (it will prevent the icon from being shrinked by the parent container)
