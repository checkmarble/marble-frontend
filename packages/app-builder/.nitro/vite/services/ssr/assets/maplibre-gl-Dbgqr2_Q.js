import { r as reactExports } from "../server.js";
import { dX as reactDomExports } from "./format-NPGUXq-g.js";
const MountedMapsContext = reactExports.createContext(null);
function arePointsEqual(a, b) {
  const ax = Array.isArray(a) ? a[0] : a ? a.x : 0;
  const ay = Array.isArray(a) ? a[1] : a ? a.y : 0;
  const bx = Array.isArray(b) ? b[0] : b ? b.x : 0;
  const by = Array.isArray(b) ? b[1] : b ? b.y : 0;
  return ax === bx && ay === by;
}
function deepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  } else if (Array.isArray(b)) {
    return false;
  }
  if (typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!b.hasOwnProperty(key)) {
        return false;
      }
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  return false;
}
function transformToViewState(tr) {
  return {
    longitude: tr.center.lng,
    latitude: tr.center.lat,
    zoom: tr.zoom,
    pitch: tr.pitch,
    bearing: tr.bearing,
    padding: tr.padding
  };
}
function applyViewStateToTransform(tr, props) {
  const v = props.viewState || props;
  const changes = {};
  if ("longitude" in v && "latitude" in v && (v.longitude !== tr.center.lng || v.latitude !== tr.center.lat)) {
    const LngLat = tr.center.constructor;
    changes.center = new LngLat(v.longitude, v.latitude);
  }
  if ("zoom" in v && v.zoom !== tr.zoom) {
    changes.zoom = v.zoom;
  }
  if ("bearing" in v && v.bearing !== tr.bearing) {
    changes.bearing = v.bearing;
  }
  if ("pitch" in v && v.pitch !== tr.pitch) {
    changes.pitch = v.pitch;
  }
  if (v.padding && tr.padding && !deepEqual(v.padding, tr.padding)) {
    changes.padding = v.padding;
  }
  return changes;
}
const refProps = ["type", "source", "source-layer", "minzoom", "maxzoom", "filter", "layout"];
function normalizeStyle(style) {
  if (!style) {
    return null;
  }
  if (typeof style === "string") {
    return style;
  }
  if ("toJS" in style) {
    style = style.toJS();
  }
  if (!style.layers) {
    return style;
  }
  const layerIndex = {};
  for (const layer of style.layers) {
    layerIndex[layer.id] = layer;
  }
  const layers = style.layers.map((layer) => {
    let normalizedLayer = null;
    if ("interactive" in layer) {
      normalizedLayer = Object.assign({}, layer);
      delete normalizedLayer.interactive;
    }
    const layerRef = layerIndex[layer.ref];
    if (layerRef) {
      normalizedLayer = normalizedLayer || Object.assign({}, layer);
      delete normalizedLayer.ref;
      for (const propName of refProps) {
        if (propName in layerRef) {
          normalizedLayer[propName] = layerRef[propName];
        }
      }
    }
    return normalizedLayer || layer;
  });
  return { ...style, layers };
}
const DEFAULT_STYLE = { version: 8, sources: {}, layers: [] };
const DEFAULT_SETTINGS = {
  minZoom: 0,
  maxZoom: 22,
  minPitch: 0,
  maxPitch: 85,
  maxBounds: [-180, -85.051129, 180, 85.051129],
  projection: "mercator",
  renderWorldCopies: true
};
const pointerEvents = {
  mousedown: "onMouseDown",
  mouseup: "onMouseUp",
  mouseover: "onMouseOver",
  mousemove: "onMouseMove",
  click: "onClick",
  dblclick: "onDblClick",
  mouseenter: "onMouseEnter",
  mouseleave: "onMouseLeave",
  mouseout: "onMouseOut",
  contextmenu: "onContextMenu",
  touchstart: "onTouchStart",
  touchend: "onTouchEnd",
  touchmove: "onTouchMove",
  touchcancel: "onTouchCancel"
};
const cameraEvents = {
  movestart: "onMoveStart",
  move: "onMove",
  moveend: "onMoveEnd",
  dragstart: "onDragStart",
  drag: "onDrag",
  dragend: "onDragEnd",
  zoomstart: "onZoomStart",
  zoom: "onZoom",
  zoomend: "onZoomEnd",
  rotatestart: "onRotateStart",
  rotate: "onRotate",
  rotateend: "onRotateEnd",
  pitchstart: "onPitchStart",
  pitch: "onPitch",
  pitchend: "onPitchEnd"
};
const otherEvents = {
  wheel: "onWheel",
  boxzoomstart: "onBoxZoomStart",
  boxzoomend: "onBoxZoomEnd",
  boxzoomcancel: "onBoxZoomCancel",
  resize: "onResize",
  load: "onLoad",
  render: "onRender",
  idle: "onIdle",
  remove: "onRemove",
  data: "onData",
  styledata: "onStyleData",
  sourcedata: "onSourceData",
  error: "onError"
};
const settingNames = [
  "minZoom",
  "maxZoom",
  "minPitch",
  "maxPitch",
  "maxBounds",
  "projection",
  "renderWorldCopies"
];
const handlerNames = [
  "scrollZoom",
  "boxZoom",
  "dragRotate",
  "dragPan",
  "keyboard",
  "doubleClickZoom",
  "touchZoomRotate",
  "touchPitch"
];
class Maplibre {
  constructor(MapClass, props, container) {
    this._map = null;
    this._internalUpdate = false;
    this._hoveredFeatures = null;
    this._propsedCameraUpdate = null;
    this._styleComponents = {};
    this._onEvent = (e) => {
      const cb = this.props[otherEvents[e.type]];
      if (cb) {
        cb(e);
      } else if (e.type === "error") {
        console.error(e.error);
      }
    };
    this._onCameraEvent = (e) => {
      if (this._internalUpdate) {
        return;
      }
      e.viewState = this._propsedCameraUpdate || transformToViewState(this._map.transform);
      const cb = this.props[cameraEvents[e.type]];
      if (cb) {
        cb(e);
      }
    };
    this._onCameraUpdate = (tr) => {
      if (this._internalUpdate) {
        return tr;
      }
      this._propsedCameraUpdate = transformToViewState(tr);
      return applyViewStateToTransform(tr, this.props);
    };
    this._onPointerEvent = (e) => {
      if (e.type === "mousemove" || e.type === "mouseout") {
        this._updateHover(e);
      }
      const cb = this.props[pointerEvents[e.type]];
      if (cb) {
        if (this.props.interactiveLayerIds && e.type !== "mouseover" && e.type !== "mouseout") {
          e.features = this._hoveredFeatures || this._queryRenderedFeatures(e.point);
        }
        cb(e);
        delete e.features;
      }
    };
    this._MapClass = MapClass;
    this.props = props;
    this._initialize(container);
  }
  get map() {
    return this._map;
  }
  setProps(props) {
    const oldProps = this.props;
    this.props = props;
    const settingsChanged = this._updateSettings(props, oldProps);
    const sizeChanged = this._updateSize(props);
    const viewStateChanged = this._updateViewState(props);
    this._updateStyle(props, oldProps);
    this._updateStyleComponents(props);
    this._updateHandlers(props, oldProps);
    if (settingsChanged || sizeChanged || viewStateChanged && !this._map.isMoving()) {
      this.redraw();
    }
  }
  static reuse(props, container) {
    const that = Maplibre.savedMaps.pop();
    if (!that) {
      return null;
    }
    const map = that.map;
    const oldContainer = map.getContainer();
    container.className = oldContainer.className;
    while (oldContainer.childNodes.length > 0) {
      container.appendChild(oldContainer.childNodes[0]);
    }
    map._container = container;
    const resizeObserver = map._resizeObserver;
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver.observe(container);
    }
    that.setProps({ ...props, styleDiffing: false });
    map.resize();
    const { initialViewState } = props;
    if (initialViewState) {
      if (initialViewState.bounds) {
        map.fitBounds(initialViewState.bounds, { ...initialViewState.fitBoundsOptions, duration: 0 });
      } else {
        that._updateViewState(initialViewState);
      }
    }
    if (map.isStyleLoaded()) {
      map.fire("load");
    } else {
      map.once("style.load", () => map.fire("load"));
    }
    map._update();
    return that;
  }
  /* eslint-disable complexity,max-statements */
  _initialize(container) {
    const { props } = this;
    const { mapStyle = DEFAULT_STYLE } = props;
    const mapOptions = {
      ...props,
      ...props.initialViewState,
      container,
      style: normalizeStyle(mapStyle)
    };
    const viewState = mapOptions.initialViewState || mapOptions.viewState || mapOptions;
    Object.assign(mapOptions, {
      center: [viewState.longitude || 0, viewState.latitude || 0],
      zoom: viewState.zoom || 0,
      pitch: viewState.pitch || 0,
      bearing: viewState.bearing || 0
    });
    if (props.gl) {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = () => {
        HTMLCanvasElement.prototype.getContext = getContext;
        return props.gl;
      };
    }
    const map = new this._MapClass(mapOptions);
    if (viewState.padding) {
      map.setPadding(viewState.padding);
    }
    if (props.cursor) {
      map.getCanvas().style.cursor = props.cursor;
    }
    map.transformCameraUpdate = this._onCameraUpdate;
    map.on("style.load", () => {
      this._styleComponents = {
        light: map.getLight(),
        sky: map.getSky(),
        // @ts-ignore getProjection() does not exist in v4
        projection: map.getProjection?.(),
        terrain: map.getTerrain()
      };
      this._updateStyleComponents(this.props);
    });
    map.on("sourcedata", () => {
      this._updateStyleComponents(this.props);
    });
    for (const eventName in pointerEvents) {
      map.on(eventName, this._onPointerEvent);
    }
    for (const eventName in cameraEvents) {
      map.on(eventName, this._onCameraEvent);
    }
    for (const eventName in otherEvents) {
      map.on(eventName, this._onEvent);
    }
    this._map = map;
  }
  /* eslint-enable complexity,max-statements */
  recycle() {
    const container = this.map.getContainer();
    const children = container.querySelector("[mapboxgl-children]");
    children?.remove();
    Maplibre.savedMaps.push(this);
  }
  destroy() {
    this._map.remove();
  }
  // Force redraw the map now. Typically resize() and jumpTo() is reflected in the next
  // render cycle, which is managed by Mapbox's animation loop.
  // This removes the synchronization issue caused by requestAnimationFrame.
  redraw() {
    const map = this._map;
    if (map.style) {
      if (map._frame) {
        map._frame.cancel();
        map._frame = null;
      }
      map._render();
    }
  }
  /* Trigger map resize if size is controlled
     @param {object} nextProps
     @returns {bool} true if size has changed
   */
  _updateSize(nextProps) {
    const { viewState } = nextProps;
    if (viewState) {
      const map = this._map;
      if (viewState.width !== map.transform.width || viewState.height !== map.transform.height) {
        map.resize();
        return true;
      }
    }
    return false;
  }
  // Adapted from map.jumpTo
  /* Update camera to match props
     @param {object} nextProps
     @param {bool} triggerEvents - should fire camera events
     @returns {bool} true if anything is changed
   */
  _updateViewState(nextProps) {
    const map = this._map;
    const tr = map.transform;
    const isMoving = map.isMoving();
    if (!isMoving) {
      const changes = applyViewStateToTransform(tr, nextProps);
      if (Object.keys(changes).length > 0) {
        this._internalUpdate = true;
        map.jumpTo(changes);
        this._internalUpdate = false;
        return true;
      }
    }
    return false;
  }
  /* Update camera constraints and projection settings to match props
     @param {object} nextProps
     @param {object} currProps
     @returns {bool} true if anything is changed
   */
  _updateSettings(nextProps, currProps) {
    const map = this._map;
    let changed = false;
    for (const propName of settingNames) {
      const propPresent = propName in nextProps || propName in currProps;
      if (propPresent && !deepEqual(nextProps[propName], currProps[propName])) {
        changed = true;
        const nextValue = propName in nextProps ? nextProps[propName] : DEFAULT_SETTINGS[propName];
        const setter = map[`set${propName[0].toUpperCase()}${propName.slice(1)}`];
        setter?.call(map, nextValue);
      }
    }
    return changed;
  }
  /* Update map style to match props */
  _updateStyle(nextProps, currProps) {
    if (nextProps.cursor !== currProps.cursor) {
      this._map.getCanvas().style.cursor = nextProps.cursor || "";
    }
    if (nextProps.mapStyle !== currProps.mapStyle) {
      const { mapStyle = DEFAULT_STYLE, styleDiffing = true } = nextProps;
      const options = {
        diff: styleDiffing
      };
      if ("localIdeographFontFamily" in nextProps) {
        options.localIdeographFontFamily = nextProps.localIdeographFontFamily;
      }
      this._map.setStyle(normalizeStyle(mapStyle), options);
    }
  }
  /* Update fog, light, projection and terrain to match props
   * These props are special because
   * 1. They can not be applied right away. Certain conditions (style loaded, source loaded, etc.) must be met
   * 2. They can be overwritten by mapStyle
   */
  _updateStyleComponents({ light, projection, sky, terrain }) {
    const map = this._map;
    const currProps = this._styleComponents;
    if (map.style?._loaded) {
      if (light && !deepEqual(light, currProps.light)) {
        currProps.light = light;
        map.setLight(light);
      }
      if (projection && !deepEqual(projection, currProps.projection) && projection !== currProps.projection?.type) {
        currProps.projection = typeof projection === "string" ? { type: projection } : projection;
        map.setProjection?.(currProps.projection);
      }
      if (sky && !deepEqual(sky, currProps.sky)) {
        currProps.sky = sky;
        map.setSky(sky);
      }
      if (terrain !== void 0 && !deepEqual(terrain, currProps.terrain)) {
        if (!terrain || map.getSource(terrain.source)) {
          currProps.terrain = terrain;
          map.setTerrain(terrain);
        }
      }
    }
  }
  /* Update interaction handlers to match props */
  _updateHandlers(nextProps, currProps) {
    const map = this._map;
    for (const propName of handlerNames) {
      const newValue = nextProps[propName] ?? true;
      const oldValue = currProps[propName] ?? true;
      if (!deepEqual(newValue, oldValue)) {
        if (newValue) {
          map[propName].enable(newValue);
        } else {
          map[propName].disable();
        }
      }
    }
  }
  _queryRenderedFeatures(point) {
    const map = this._map;
    const { interactiveLayerIds = [] } = this.props;
    try {
      return map.queryRenderedFeatures(point, {
        layers: interactiveLayerIds.filter(map.getLayer.bind(map))
      });
    } catch {
      return [];
    }
  }
  _updateHover(e) {
    const { props } = this;
    const shouldTrackHoveredFeatures = props.interactiveLayerIds && (props.onMouseMove || props.onMouseEnter || props.onMouseLeave);
    if (shouldTrackHoveredFeatures) {
      const eventType = e.type;
      const wasHovering = this._hoveredFeatures?.length > 0;
      const features = this._queryRenderedFeatures(e.point);
      const isHovering = features.length > 0;
      if (!isHovering && wasHovering) {
        e.type = "mouseleave";
        this._onPointerEvent(e);
      }
      this._hoveredFeatures = features;
      if (isHovering && !wasHovering) {
        e.type = "mouseenter";
        this._onPointerEvent(e);
      }
      e.type = eventType;
    } else {
      this._hoveredFeatures = null;
    }
  }
}
Maplibre.savedMaps = [];
const skipMethods = [
  "setMaxBounds",
  "setMinZoom",
  "setMaxZoom",
  "setMinPitch",
  "setMaxPitch",
  "setRenderWorldCopies",
  "setProjection",
  "setStyle",
  "addSource",
  "removeSource",
  "addLayer",
  "removeLayer",
  "setLayerZoomRange",
  "setFilter",
  "setPaintProperty",
  "setLayoutProperty",
  "setLight",
  "setTerrain",
  "setFog",
  "remove"
];
function createRef(mapInstance) {
  if (!mapInstance) {
    return null;
  }
  const map = mapInstance.map;
  const result = {
    getMap: () => map
  };
  for (const key of getMethodNames(map)) {
    if (!(key in result) && !skipMethods.includes(key)) {
      result[key] = map[key].bind(map);
    }
  }
  return result;
}
function getMethodNames(obj) {
  const result = /* @__PURE__ */ new Set();
  let proto = obj;
  while (proto) {
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key[0] !== "_" && typeof obj[key] === "function" && key !== "fire" && key !== "setEventedParent") {
        result.add(key);
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return Array.from(result);
}
const useIsomorphicLayoutEffect = typeof document !== "undefined" ? reactExports.useLayoutEffect : reactExports.useEffect;
function setGlobals(mapLib, props) {
  const { RTLTextPlugin, maxParallelImageRequests, workerCount, workerUrl } = props;
  if (RTLTextPlugin && mapLib.getRTLTextPluginStatus && mapLib.getRTLTextPluginStatus() === "unavailable") {
    const { pluginUrl, lazy = true } = typeof RTLTextPlugin === "string" ? { pluginUrl: RTLTextPlugin } : RTLTextPlugin;
    mapLib.setRTLTextPlugin(pluginUrl, (error) => {
      if (error) {
        console.error(error);
      }
    }, lazy);
  }
  if (maxParallelImageRequests !== void 0) {
    mapLib.setMaxParallelImageRequests(maxParallelImageRequests);
  }
  if (workerCount !== void 0) {
    mapLib.setWorkerCount(workerCount);
  }
  if (workerUrl !== void 0) {
    mapLib.setWorkerUrl(workerUrl);
  }
}
const MapContext = reactExports.createContext(null);
function _Map(props, ref) {
  const mountedMapsContext = reactExports.useContext(MountedMapsContext);
  const [mapInstance, setMapInstance] = reactExports.useState(null);
  const containerRef = reactExports.useRef();
  const { current: contextValue } = reactExports.useRef({ mapLib: null, map: null });
  reactExports.useEffect(() => {
    const mapLib = props.mapLib;
    let isMounted = true;
    let maplibre;
    Promise.resolve(mapLib || import("./maplibre-gl-BFGdGsAD.js").then((n) => n.m)).then((module) => {
      if (!isMounted) {
        return;
      }
      if (!module) {
        throw new Error("Invalid mapLib");
      }
      const mapboxgl = "Map" in module ? module : module.default;
      if (!mapboxgl.Map) {
        throw new Error("Invalid mapLib");
      }
      setGlobals(mapboxgl, props);
      if (props.reuseMaps) {
        maplibre = Maplibre.reuse(props, containerRef.current);
      }
      if (!maplibre) {
        maplibre = new Maplibre(mapboxgl.Map, props, containerRef.current);
      }
      contextValue.map = createRef(maplibre);
      contextValue.mapLib = mapboxgl;
      setMapInstance(maplibre);
      mountedMapsContext?.onMapMount(contextValue.map, props.id);
    }).catch((error) => {
      const { onError } = props;
      if (onError) {
        onError({
          type: "error",
          target: null,
          originalEvent: null,
          error
        });
      } else {
        console.error(error);
      }
    });
    return () => {
      isMounted = false;
      if (maplibre) {
        mountedMapsContext?.onMapUnmount(props.id);
        if (props.reuseMaps) {
          maplibre.recycle();
        } else {
          maplibre.destroy();
        }
      }
    };
  }, []);
  useIsomorphicLayoutEffect(() => {
    if (mapInstance) {
      mapInstance.setProps(props);
    }
  });
  reactExports.useImperativeHandle(ref, () => contextValue.map, [mapInstance]);
  const style = reactExports.useMemo(() => ({
    position: "relative",
    width: "100%",
    height: "100%",
    ...props.style
  }), [props.style]);
  const CHILD_CONTAINER_STYLE = {
    height: "100%"
  };
  return reactExports.createElement("div", { id: props.id, ref: containerRef, style }, mapInstance && reactExports.createElement(
    MapContext.Provider,
    { value: contextValue },
    reactExports.createElement("div", { "mapboxgl-children": "", style: CHILD_CONTAINER_STYLE }, props.children)
  ));
}
const Map = reactExports.forwardRef(_Map);
const unitlessNumber = /box|flex|grid|column|lineHeight|fontWeight|opacity|order|tabSize|zIndex/;
function applyReactStyle(element, styles) {
  if (!element || !styles) {
    return;
  }
  const style = element.style;
  for (const key in styles) {
    const value = styles[key];
    if (Number.isFinite(value) && !unitlessNumber.test(key)) {
      style[key] = `${value}px`;
    } else {
      style[key] = value;
    }
  }
}
function compareClassNames(prevClassName, nextClassName) {
  if (prevClassName === nextClassName) {
    return null;
  }
  const prevClassList = getClassList(prevClassName);
  const nextClassList = getClassList(nextClassName);
  const diff = [];
  for (const c of nextClassList) {
    if (!prevClassList.has(c)) {
      diff.push(c);
    }
  }
  for (const c of prevClassList) {
    if (!nextClassList.has(c)) {
      diff.push(c);
    }
  }
  return diff.length === 0 ? null : diff;
}
function getClassList(className) {
  return new Set(className ? className.trim().split(/\s+/) : []);
}
const Marker = reactExports.memo(reactExports.forwardRef((props, ref) => {
  const { map, mapLib } = reactExports.useContext(MapContext);
  const thisRef = reactExports.useRef({ props });
  const marker = reactExports.useMemo(() => {
    let hasChildren = false;
    reactExports.Children.forEach(props.children, (el) => {
      if (el) {
        hasChildren = true;
      }
    });
    const options = {
      ...props,
      element: hasChildren ? document.createElement("div") : void 0
    };
    const mk = new mapLib.Marker(options);
    mk.setLngLat([props.longitude, props.latitude]);
    mk.getElement().addEventListener("click", (e) => {
      thisRef.current.props.onClick?.({
        type: "click",
        target: mk,
        originalEvent: e
      });
    });
    mk.on("dragstart", (e) => {
      const evt = e;
      evt.lngLat = marker.getLngLat();
      thisRef.current.props.onDragStart?.(evt);
    });
    mk.on("drag", (e) => {
      const evt = e;
      evt.lngLat = marker.getLngLat();
      thisRef.current.props.onDrag?.(evt);
    });
    mk.on("dragend", (e) => {
      const evt = e;
      evt.lngLat = marker.getLngLat();
      thisRef.current.props.onDragEnd?.(evt);
    });
    return mk;
  }, []);
  reactExports.useEffect(() => {
    marker.addTo(map.getMap());
    return () => {
      marker.remove();
    };
  }, []);
  const { longitude, latitude, offset, style, draggable = false, popup = null, rotation = 0, rotationAlignment = "auto", pitchAlignment = "auto" } = props;
  reactExports.useEffect(() => {
    applyReactStyle(marker.getElement(), style);
  }, [style]);
  reactExports.useImperativeHandle(ref, () => marker, []);
  const oldProps = thisRef.current.props;
  if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude) {
    marker.setLngLat([longitude, latitude]);
  }
  if (offset && !arePointsEqual(marker.getOffset(), offset)) {
    marker.setOffset(offset);
  }
  if (marker.isDraggable() !== draggable) {
    marker.setDraggable(draggable);
  }
  if (marker.getRotation() !== rotation) {
    marker.setRotation(rotation);
  }
  if (marker.getRotationAlignment() !== rotationAlignment) {
    marker.setRotationAlignment(rotationAlignment);
  }
  if (marker.getPitchAlignment() !== pitchAlignment) {
    marker.setPitchAlignment(pitchAlignment);
  }
  if (marker.getPopup() !== popup) {
    marker.setPopup(popup);
  }
  const classNameDiff = compareClassNames(oldProps.className, props.className);
  if (classNameDiff) {
    for (const c of classNameDiff) {
      marker.toggleClassName(c);
    }
  }
  thisRef.current.props = props;
  return reactDomExports.createPortal(props.children, marker.getElement());
}));
reactExports.memo(reactExports.forwardRef((props, ref) => {
  const { map, mapLib } = reactExports.useContext(MapContext);
  const container = reactExports.useMemo(() => {
    return document.createElement("div");
  }, []);
  const thisRef = reactExports.useRef({ props });
  const popup = reactExports.useMemo(() => {
    const options = { ...props };
    const pp = new mapLib.Popup(options);
    pp.setLngLat([props.longitude, props.latitude]);
    pp.once("open", (e) => {
      thisRef.current.props.onOpen?.(e);
    });
    return pp;
  }, []);
  reactExports.useEffect(() => {
    const onClose = (e) => {
      thisRef.current.props.onClose?.(e);
    };
    popup.on("close", onClose);
    popup.setDOMContent(container).addTo(map.getMap());
    return () => {
      popup.off("close", onClose);
      if (popup.isOpen()) {
        popup.remove();
      }
    };
  }, []);
  reactExports.useEffect(() => {
    applyReactStyle(popup.getElement(), props.style);
  }, [props.style]);
  reactExports.useImperativeHandle(ref, () => popup, []);
  if (popup.isOpen()) {
    const oldProps = thisRef.current.props;
    if (popup.getLngLat().lng !== props.longitude || popup.getLngLat().lat !== props.latitude) {
      popup.setLngLat([props.longitude, props.latitude]);
    }
    if (props.offset && !deepEqual(oldProps.offset, props.offset)) {
      popup.setOffset(props.offset);
    }
    if (oldProps.anchor !== props.anchor || oldProps.maxWidth !== props.maxWidth) {
      popup.options.anchor = props.anchor;
      popup.setMaxWidth(props.maxWidth);
    }
    const classNameDiff = compareClassNames(oldProps.className, props.className);
    if (classNameDiff) {
      for (const c of classNameDiff) {
        popup.toggleClassName(c);
      }
    }
    thisRef.current.props = props;
  }
  return reactDomExports.createPortal(props.children, container);
}));
function useControl(onCreate, arg1, arg2, arg3) {
  const context = reactExports.useContext(MapContext);
  const ctrl = reactExports.useMemo(() => onCreate(context), []);
  reactExports.useEffect(() => {
    const opts = arg1;
    const onAdd = typeof arg1 === "function" && false ? arg1 : null;
    const onRemove = typeof arg1 === "function" ? arg1 : null;
    const { map } = context;
    if (!map.hasControl(ctrl)) {
      map.addControl(ctrl, opts?.position);
      if (onAdd) {
        onAdd(context);
      }
    }
    return () => {
      if (onRemove) {
        onRemove(context);
      }
      if (map.hasControl(ctrl)) {
        map.removeControl(ctrl);
      }
    };
  }, []);
  return ctrl;
}
function _AttributionControl(props) {
  const ctrl = useControl(({ mapLib }) => new mapLib.AttributionControl(props), {
    position: props.position
  });
  reactExports.useEffect(() => {
    applyReactStyle(ctrl._container, props.style);
  }, [props.style]);
  return null;
}
reactExports.memo(_AttributionControl);
function _FullscreenControl(props) {
  const ctrl = useControl(({ mapLib }) => new mapLib.FullscreenControl({
    container: props.containerId && document.getElementById(props.containerId)
  }), { position: props.position });
  reactExports.useEffect(() => {
    applyReactStyle(ctrl._controlContainer, props.style);
  }, [props.style]);
  return null;
}
reactExports.memo(_FullscreenControl);
function _GeolocateControl(props, ref) {
  const thisRef = reactExports.useRef({ props });
  const ctrl = useControl(({ mapLib }) => {
    const gc = new mapLib.GeolocateControl(props);
    const setupUI = gc._setupUI;
    gc._setupUI = () => {
      if (!gc._container.hasChildNodes()) {
        setupUI();
      }
    };
    gc.on("geolocate", (e) => {
      thisRef.current.props.onGeolocate?.(e);
    });
    gc.on("error", (e) => {
      thisRef.current.props.onError?.(e);
    });
    gc.on("outofmaxbounds", (e) => {
      thisRef.current.props.onOutOfMaxBounds?.(e);
    });
    gc.on("trackuserlocationstart", (e) => {
      thisRef.current.props.onTrackUserLocationStart?.(e);
    });
    gc.on("trackuserlocationend", (e) => {
      thisRef.current.props.onTrackUserLocationEnd?.(e);
    });
    return gc;
  }, { position: props.position });
  thisRef.current.props = props;
  reactExports.useImperativeHandle(ref, () => ctrl, []);
  reactExports.useEffect(() => {
    applyReactStyle(ctrl._container, props.style);
  }, [props.style]);
  return null;
}
reactExports.memo(reactExports.forwardRef(_GeolocateControl));
function _NavigationControl(props) {
  const ctrl = useControl(({ mapLib }) => new mapLib.NavigationControl(props), {
    position: props.position
  });
  reactExports.useEffect(() => {
    applyReactStyle(ctrl._container, props.style);
  }, [props.style]);
  return null;
}
reactExports.memo(_NavigationControl);
function _ScaleControl(props) {
  const ctrl = useControl(({ mapLib }) => new mapLib.ScaleControl(props), {
    position: props.position
  });
  const propsRef = reactExports.useRef(props);
  const prevProps = propsRef.current;
  propsRef.current = props;
  const { style } = props;
  if (props.maxWidth !== void 0 && props.maxWidth !== prevProps.maxWidth) {
    ctrl.options.maxWidth = props.maxWidth;
  }
  if (props.unit !== void 0 && props.unit !== prevProps.unit) {
    ctrl.setUnit(props.unit);
  }
  reactExports.useEffect(() => {
    applyReactStyle(ctrl._container, style);
  }, [style]);
  return null;
}
reactExports.memo(_ScaleControl);
function _TerrainControl(props) {
  const ctrl = useControl(({ mapLib }) => new mapLib.TerrainControl(props), {
    position: props.position
  });
  reactExports.useEffect(() => {
    applyReactStyle(ctrl._container, props.style);
  }, [props.style]);
  return null;
}
reactExports.memo(_TerrainControl);
function _LogoControl(props) {
  const ctrl = useControl(({ mapLib }) => new mapLib.LogoControl(props), { position: props.position });
  reactExports.useEffect(() => {
    applyReactStyle(ctrl._container, props.style);
  }, [props.style]);
  return null;
}
reactExports.memo(_LogoControl);
export {
  Map as M,
  Marker as a
};
