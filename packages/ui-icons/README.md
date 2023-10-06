# @ui-icons

This package contains all the icons used in the UI. This generate a React component for each svg icon.

## Add an icon

1. Get an svg export of your icon

> On Figma, ensure you select the Icon + Slice that make sense (= with the proper width & height) like in the above picture

![extract-svg-figma](./docs/extract-svg-figma.png)

2. Add the svg in `/svgs`

> a good convention is to keep the exported name from Figma, to make it easier to find already imported assets

3. Run `pnpm --filter ui-icons run generate-icons`

4. Check the generated file in `/src/`: it must have `<path fill="currentColor"/>` (it makes the icon color customizable). If this not the case :

   1. No `fill=*` in the genereted file : you must edit the `.svg` file and add it manually.
      > `<path fill="#080525" ... />` in should work.
   2. `fill=#.....` in the genereted file : you must add `#...` hex color to the `replaceAttrValues` array in `packages/ui-icons/scripts/generate.ts`

5. Commit your changes
