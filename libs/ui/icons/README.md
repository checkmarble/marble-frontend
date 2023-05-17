# ui-icons

This library was generated with [Nx](https://nx.dev).

## Add an icon

1. Get an svg export of your icon

> Ensure you select the Icon + Slice that make sense (= with the proper width & height) like in the above picture

![extract-svg-figma](./docs/extract-svg-figma.png)

2. Add the svg in `src/svgs`

> a good convention is to keep the exported name from Figma, to make it easier to find already imported assets)

3. Run the `icons-gen` target (cf `project.json`)

4. Commit your changes
