import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { e7 as Primitive, b as clsx } from "./format-NPGUXq-g.js";
var NAME = "Separator";
var DEFAULT_ORIENTATION = "horizontal";
var ORIENTATIONS = ["horizontal", "vertical"];
var Separator$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { decorative, orientation: orientationProp = DEFAULT_ORIENTATION, ...domProps } = props;
  const orientation = isValidOrientation(orientationProp) ? orientationProp : DEFAULT_ORIENTATION;
  const ariaOrientation = orientation === "vertical" ? orientation : void 0;
  const semanticProps = decorative ? { role: "none" } : { "aria-orientation": ariaOrientation, role: "separator" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-orientation": orientation,
      ...semanticProps,
      ...domProps,
      ref: forwardedRef
    }
  );
});
Separator$1.displayName = NAME;
function isValidOrientation(orientation) {
  return ORIENTATIONS.includes(orientation);
}
function Separator({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Separator$1,
    {
      className: clsx(
        "radix-orientation-horizontal:h-px radix-orientation-horizontal:w-full",
        "radix-orientation-vertical:w-px radix-orientation-vertical:h-full",
        className
      ),
      ...props
    }
  );
}
export {
  Separator as S
};
