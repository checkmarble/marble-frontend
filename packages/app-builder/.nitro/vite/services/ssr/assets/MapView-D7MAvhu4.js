import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useTheme } from "./ThemeContext-B40HQxfH.js";
import { M as Map, a as Marker } from "./maplibre-gl-Dbgqr2_Q.js";
import { e as Icon } from "./format-NPGUXq-g.js";
import { h as CARTO_BASEMAP } from "./DataField-vckdVtrg.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./config-ut8rAdyo.js";
import "./short-uuid-MIi3jWzx.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./CopyToClipboardButton-CJNJJful.js";
import "./Spinner-GK6cEAdR.js";
import "./data-BFm2FCTm.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./auth-middleware-C4ap47rJ.js";
import "./data-fdG1PpsD.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./useServerFn-CrqFKl7V.js";
import "./isNonNullish-DgEqPJBU.js";
import "./data-model-B-Bz1o1P.js";
import "./create-context-CYc8deix.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./mapToObj-wQ-uHOuD.js";
import "./omit-ZO4dmkWK.js";
function MapView({ latitude, longitude, mapHeight }) {
  const { theme } = useTheme();
  const mapRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [longitude, latitude], duration: 1e3 });
  }, [latitude, longitude]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "isolate overflow-hidden rounded-lg border border-grey-border bg-surface-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Map,
    {
      ref: mapRef,
      initialViewState: { latitude, longitude, zoom: 5 },
      style: { width: "100%", height: mapHeight },
      mapStyle: CARTO_BASEMAP[theme],
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Marker, { longitude, latitude, anchor: "bottom", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "map-pin", className: "size-4 text-red-primary" }) })
    }
  ) });
}
export {
  MapView
};
