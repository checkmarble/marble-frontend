# @ui-icons

This package contains all the icons used in the UI. This generate a React component for each svg icon.

## Add an icon

1. Get an svg export of your icon

> Ensure you select the Icon + Slice that make sense (= with the proper width & height) like in the above picture

![extract-svg-figma](./docs/extract-svg-figma.png)

2. Add the svg in `/svgs`

> a good convention is to keep the exported name from Figma, to make it easier to find already imported assets

3. Run `pnpm --filter ui-icons run generate-icons`

4. Commit your changes
