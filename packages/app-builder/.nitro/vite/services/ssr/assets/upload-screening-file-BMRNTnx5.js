import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { b as useDropzone, M as MAX_FILE_SIZE } from "./useFormDropzone-BjTKexsf.js";
import { e4 as Modal, u as useTranslation, B as Button, e as Icon, b as clsx } from "./format-NPGUXq-g.js";
import { n } from "./CopyToClipboardButton-CJNJJful.js";
import { aM as t, b as captureException } from "./services-middleware-DR8Hua1Y.js";
import { u as uploadScreeningFileFn } from "./screenings-CS8peAlI.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
function UploadFile({
  uploadFileEndpoint,
  children
}) {
  const [open, setOpen] = reactExports.useState(false);
  const revalidate = useLoaderRevalidator();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      UploadFileContent,
      {
        uploadFileEndpoint,
        setOpen,
        onUploadCompleted: () => {
          setOpen(false);
          revalidate();
        }
      }
    ) })
  ] });
}
function UploadFileContent({ uploadFileEndpoint, setOpen, onUploadCompleted }) {
  const { t: t$1 } = useTranslation(["common", "cases"]);
  const [loading, setLoading] = reactExports.useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      void onDrop(acceptedFiles);
    },
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/pdf": [".pdf"],
      "application/zip": [".zip"],
      "application/msword": [".doc", ".docx"],
      "application/vnd.openxmlformats-officedocument.*": [".docx", ".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/*": [".csv", ".txt"]
    },
    multiple: true,
    maxSize: MAX_FILE_SIZE
  });
  const onDrop = async (acceptedFiles) => {
    if (!t(acceptedFiles, 1)) {
      n.error("Please select a file");
      return;
    }
    let success = false;
    try {
      setLoading(true);
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append("file[]", file);
      });
      const response = await uploadFileEndpoint(formData);
      if (!response.ok) {
        captureException(await response.text());
        n.error("An error occurred while trying to upload the file.");
        return;
      }
      setLoading(false);
      setOpen(false);
      success = true;
    } catch (error) {
      captureException(error);
      n.error("An error occurred while trying to upload the file.");
    } finally {
      setLoading(false);
    }
    onUploadCompleted(success);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t$1("cases:add_file") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ...getRootProps(),
        className: clsx(
          "text-s flex h-60 flex-col items-center justify-center gap-md rounded-sm border-2 border-dashed",
          isDragActive ? "bg-purple-background border-purple-disabled opacity-90" : "border-grey-placeholder"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...getInputProps() }),
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loading, { className: "border-none" }) : null,
          !loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t$1("cases:drop_file_cta") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t$1("cases:drop_file_accepted_types") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-secondary uppercase", children: t$1("common:or") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
              t$1("cases:pick_file_cta")
            ] })
          ] }) : null
        ]
      }
    ) })
  ] });
}
const Loading = ({ className }) => {
  const { t: t2 } = useTranslation(["common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: clsx(
        className,
        "border-grey-placeholder flex h-60 flex-col items-center justify-center gap-md rounded-sm border-2 border-dashed"
      ),
      children: t2("common:loading")
    }
  );
};
const useUploadScreeningFile = (screeningId) => {
  const uploadScreeningFile = useServerFn(uploadScreeningFileFn);
  return useMutation({
    mutationFn: async (formData) => {
      const enriched = new FormData();
      for (const [key, value] of formData.entries()) {
        enriched.append(key, value);
      }
      enriched.append("screeningId", screeningId);
      return uploadScreeningFile({ data: enriched });
    }
  });
};
export {
  UploadFile as U,
  useUploadScreeningFile as u
};
