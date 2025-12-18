import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { e7 as Primitive, dL as useCallbackRef, dO as useLayoutEffect2, dJ as createContextScope, f as cva } from "./format-NPGUXq-g.js";
var AVATAR_NAME = "Avatar";
var [createAvatarContext] = createContextScope(AVATAR_NAME);
var STATIC_IMAGE_COUNT_STATE = [
  0,
  () => void 0
];
var [AvatarProvider, useAvatarContext] = createAvatarContext(AVATAR_NAME);
var Avatar$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, ...avatarProps } = props;
    const [imageLoadingStatus, setImageLoadingStatus] = reactExports.useState("idle");
    const [imageCount, setImageCount] = useImageCount();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvatarProvider,
      {
        scope: __scopeAvatar,
        imageLoadingStatus,
        setImageLoadingStatus,
        imageCount,
        setImageCount,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...avatarProps, ref: forwardedRef })
      }
    );
  }
);
Avatar$1.displayName = AVATAR_NAME;
var IMAGE_NAME = "AvatarImage";
var AvatarImage = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, src, onLoadingStatusChange, ...imageProps } = props;
    const context = useAvatarContext(IMAGE_NAME, __scopeAvatar);
    useUpdateImageCount(context.setImageCount);
    const imageLoadingStatus = useImageLoadingStatus(src, {
      referrerPolicy: imageProps.referrerPolicy,
      crossOrigin: imageProps.crossOrigin,
      loadingStatus: context.imageLoadingStatus,
      setLoadingStatus: context.setImageLoadingStatus
    });
    const handleLoadingStatusChange = useCallbackRef((status) => {
      onLoadingStatusChange?.(status);
    });
    const loadingStatusRef = reactExports.useRef(imageLoadingStatus);
    useLayoutEffect2(() => {
      const previousLoadingStatus = loadingStatusRef.current;
      loadingStatusRef.current = imageLoadingStatus;
      if (imageLoadingStatus !== previousLoadingStatus) {
        handleLoadingStatusChange(imageLoadingStatus);
      }
    }, [imageLoadingStatus, handleLoadingStatusChange]);
    return imageLoadingStatus === "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.img, { ...imageProps, ref: forwardedRef, src }) : null;
  }
);
AvatarImage.displayName = IMAGE_NAME;
var FALLBACK_NAME = "AvatarFallback";
var AvatarFallback = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, delayMs, ...fallbackProps } = props;
    const context = useAvatarContext(FALLBACK_NAME, __scopeAvatar);
    const [canRender, setCanRender] = reactExports.useState(delayMs === void 0);
    reactExports.useEffect(() => {
      if (delayMs !== void 0) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs);
        return () => window.clearTimeout(timerId);
      }
    }, [delayMs]);
    return canRender && context.imageLoadingStatus !== "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...fallbackProps, ref: forwardedRef }) : null;
  }
);
AvatarFallback.displayName = FALLBACK_NAME;
function useImageLoadingStatus(src, {
  loadingStatus,
  setLoadingStatus,
  referrerPolicy,
  crossOrigin
}) {
  useLayoutEffect2(() => {
    if (!src) {
      setLoadingStatus("error");
      return;
    }
    const image = new window.Image();
    const handleLoad = (event) => {
      const image2 = event.currentTarget;
      setLoadingStatus(getImageLoadingStatus(image2));
    };
    const handleError = () => setLoadingStatus("error");
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    image.crossOrigin = crossOrigin ?? null;
    image.src = src;
    setLoadingStatus(getImageLoadingStatus(image));
    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      setLoadingStatus("idle");
    };
  }, [src, crossOrigin, referrerPolicy, setLoadingStatus]);
  return loadingStatus;
}
function getImageLoadingStatus(image) {
  return image.complete ? image.naturalWidth > 0 ? "loaded" : "error" : "loading";
}
function useImageCount() {
  let state = STATIC_IMAGE_COUNT_STATE;
  {
    state = reactExports.useState(0);
    const [imageCount] = state;
    const hasWarnedRef = reactExports.useRef(false);
    reactExports.useEffect(() => {
      if (imageCount > 1 && !hasWarnedRef.current) {
        hasWarnedRef.current = true;
        console.warn(
          "Avatar: Only one `Avatar.Image` component should be rendered per `Avatar.Root`, but multiple were detected. This will lead to unexpected behavior."
        );
      }
    }, [imageCount]);
  }
  return state;
}
function useUpdateImageCount(setImageCount) {
  {
    reactExports.useEffect(() => {
      setImageCount((imageCount) => imageCount + 1);
      return () => {
        setImageCount((imageCount) => imageCount - 1);
      };
    }, [setImageCount]);
  }
}
const avatar = cva("inline-flex select-none items-center justify-center overflow-hidden rounded-full shrink-0", {
  variants: {
    color: {
      default: "bg-purple-background border-2 border-purple-primary dark:bg-grey-background dark:text-purple-primary",
      grey: "bg-grey-border",
      transparent: "bg-transparent border border-grey-border"
    },
    size: {
      xxs: "size-6 text-2xs",
      xs: "size-6 text-small",
      s: "size-8 text-s",
      m: "size-10 text-m",
      l: "size-14 text-l",
      xl: "size-16 text-l"
    }
  },
  defaultVariants: {
    size: "m",
    color: "default"
  }
});
function Avatar({ firstName, lastName, src, size, color, className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Avatar$1,
    {
      className: avatar({
        size,
        color,
        className
      }),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AvatarImage,
          {
            referrerPolicy: "no-referrer",
            className: "size-full object-cover",
            src,
            alt: firstName || lastName ? `${firstName ?? ""} ${lastName ?? ""}` : "Unknown user"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AvatarFallback,
          {
            className: "text-grey-primary dark:text-purple-primary flex size-full items-center justify-center text-center font-normal uppercase",
            delayMs: src ? 400 : 0,
            children: `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}` || "👤"
          }
        )
      ]
    }
  );
}
export {
  Avatar as A
};
