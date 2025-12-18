import { R as jsxRuntimeExports } from "../server.js";
import { H as isNotFoundHttpError } from "./services-middleware-DR8Hua1Y.js";
import { u as useObjectDetailsQuery, e as DataFields } from "./DataField-vckdVtrg.js";
import { u as useTranslation, e4 as Modal } from "./format-NPGUXq-g.js";
function IngestedObjectDetailModal({
  dataModel,
  tableName,
  objectId,
  onClose
}) {
  const { t } = useTranslation(["data"]);
  const { data: object, isPending, error } = useObjectDetailsQuery(tableName, objectId);
  if (isPending) {
    return null;
  }
  const noObjectFound = isNotFoundHttpError(error);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal.Root,
    {
      open: true,
      onOpenChange: (isOpen) => {
        if (!isOpen) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "large", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: tableName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-y-auto max-h-[calc(100vh-140px)]", children: object && !noObjectFound ? /* @__PURE__ */ jsxRuntimeExports.jsx(DataFields, { table: tableName, object, options: { hideLinks: true } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md text-center", children: t("data:viewer.no_object_found", { tableName, objectId }) }) })
      ] })
    }
  );
}
export {
  IngestedObjectDetailModal as I
};
