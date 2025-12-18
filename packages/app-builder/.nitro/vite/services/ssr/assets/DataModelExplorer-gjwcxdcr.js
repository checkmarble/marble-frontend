import { O as useRouter, R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { u as useCallbackRef } from "./use-callback-ref-DXzIzfqy.js";
import { u as useTranslation, e as Icon, d as cn, e4 as Modal, s as Trans, B as Button, b as clsx, e8 as MenuCommand, j as Tag, fg as useReactTable, em as getCoreRowModel, fh as flexRender, el as createColumnHelper, e9 as Popover, c as createSimpleContext } from "./format-NPGUXq-g.js";
import { m as deleteAnnotationFn, n as listObjectsFn } from "./data-BFm2FCTm.js";
import { u as useInfiniteQuery } from "./useInfiniteQuery-D2tvMYRf.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { p as parseUnknownData } from "./DataField-vckdVtrg.js";
import { M, aX as z } from "./services-middleware-DR8Hua1Y.js";
import { F as FormatData } from "./FormatData-TXRe9nHU.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useCreateAnnotationMutation, C as ClientCommentForm } from "./ClientCommentForm-D-0vcWN7.js";
import { u as useDownloadFile, A as AlreadyDownloadingError, a as AuthRequestError } from "./DownloadFilesService-BW-xJtj3.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useFormDropzone, a as MAX_FILE_SIZE_MB } from "./useFormDropzone-BjTKexsf.js";
import { a as createFileAnnotationSchema, t as tagAnnotationFormSchema } from "./annotations-DpAN3M8g.js";
import { h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { t as toggle } from "./array-BFSjnO9c.js";
import { T as TagPreview } from "./TagPreview-CjmrrQF6.js";
import { u as useOrganizationObjectTags } from "./organization-object-tags-C9Gf0Ixc.js";
import { t } from "./isDeepEqual-C0XXZLYo.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import { A as Avatar } from "./Avatar-DpA4jY60.js";
import { E as EventTime } from "./Time-IafhAG3W.js";
function AnnotationFileDownload({ annotationId, fileId }) {
  const { t: t2 } = useTranslation(["cases", "common"]);
  const router = useRouter();
  const downloadEndpoint = router.buildLocation({
    to: "/ressources/annotations/download-file/$annotationId/$fileId",
    params: {
      annotationId,
      fileId
    }
  });
  const { downloadCaseFile, downloadingCaseFile } = useDownloadFile(downloadEndpoint.href, {
    onError: (e) => {
      if (e instanceof AlreadyDownloadingError) {
        return;
      } else if (e instanceof AuthRequestError) {
        zt.error(t2("cases:case.file.errors.downloading_link.auth_error"));
      } else {
        zt.error(t2("cases:case.file.errors.downloading_link.unknown"));
      }
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "size-5", onClick: () => downloadCaseFile(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Icon,
    {
      icon: downloadingCaseFile ? "spinner" : "download",
      className: cn("size-5", { "animate-spin": downloadingCaseFile })
    }
  ) });
}
const useDeleteAnnotationMutation = (annotationId) => {
  const deleteAnnotation = useServerFn(deleteAnnotationFn);
  return useMutation({
    mutationKey: ["annotations", "delete-annotation", annotationId],
    mutationFn: async () => deleteAnnotation({ data: { annotationId } })
  });
};
function RemoveFileAnnotation({ annotation, onClose, onDelete }) {
  const { t: t2 } = useTranslation(["cases", "common"]);
  const filenames = annotation.payload.files.map((f) => f.filename);
  const deleteAnnotationMutation = useDeleteAnnotationMutation(annotation.id);
  const revalidate = useLoaderRevalidator();
  const handleDelete = useCallbackRef(() => {
    deleteAnnotationMutation.mutateAsync().then((result) => {
      revalidate();
      if (result.success) {
        zt.success(t2("common:success.deleted"));
        onDelete?.();
        onClose();
      } else {
        zt.error(t2("common:errors.unknown"));
      }
    }).catch(() => {
      zt.error(t2("common:errors.unknown"));
    });
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Root, { open: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "cases:annotations.delete_files.title",
        components: {
          Filenames: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary" })
        },
        values: {
          filenames
        }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel"), onClick: onClose }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { variant: "destructive", label: t2("common:delete"), onClick: handleDelete })
    ] })
  ] }) });
}
function ClientDocumentsPopover({
  caseId,
  tableName,
  objectId,
  documents,
  onAnnotateSuccess
}) {
  const { t: t2 } = useTranslation(["cases", "common"]);
  const createAnnotationMutation = useCreateAnnotationMutation();
  const [annotationToDelete, setAnnotationToDelete] = reactExports.useState(null);
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      caseId,
      tableName,
      objectId,
      type: "file",
      payload: {
        files: []
      }
    },
    validators: {
      onSubmit: createFileAnnotationSchema
    },
    onSubmit({ value }) {
      createAnnotationMutation.mutateAsync(value).then((result) => {
        revalidate();
        if (result.success) {
          form.setFieldValue("payload.files", []);
          onAnnotateSuccess?.();
        } else if ("error" in result && result.error === "file_too_large") {
          zt.error(t2("common:max_size_exceeded", { size: MAX_FILE_SIZE_MB }));
        } else {
          zt.error(t2("common:errors.unknown"));
        }
      }).catch(() => {
        zt.error(t2("common:errors.unknown"));
      });
    }
  });
  reactExports.useEffect(() => {
    form.validate("mount");
  }, [form]);
  const { getInputProps, getRootProps } = useFormDropzone({
    onDrop: (acceptedFiles) => {
      form.setFieldValue("payload.files", (prev) => [...prev, ...acceptedFiles]);
      form.validate("change");
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      form.Field,
      {
        name: "payload.files",
        validators: {
          onChange: createFileAnnotationSchema._def.right.shape.payload.shape.files,
          onBlur: createFileAnnotationSchema._def.right.shape.payload.shape.files
        },
        children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm px-md py-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...getInputProps() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "flex items-center justify-between gap-xl text-left", ...getRootProps(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-r flex items-center gap-sm", children: t2("cases:annotations.documents.add_file") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-secondary", children: [
                t2("cases:annotations.documents.upload_file"),
                ": jpg, png, pdf, zip, doc, docx, xls, xlsx"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "upload", className: "size-5 shrink-0" })
          ] }),
          field.state.value.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-xs", children: field.state.value.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "border-grey-border flex max-w-24 items-center gap-xs rounded-sm border px-sm py-2xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-xs font-medium", children: file.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Icon,
                    {
                      icon: "cross",
                      className: "text-grey-secondary hover:text-grey-primary size-5 shrink-0 cursor-pointer",
                      onClick: (e) => {
                        e.preventDefault();
                        field.handleChange((prev) => toggle(prev, file));
                        form.validate("change");
                      }
                    }
                  )
                ]
              },
              file.name
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (state) => [state.canSubmit, state.isSubmitting], children: ([canSubmit, isSubmitting]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", mode: "icon", variant: "primary", disabled: !canSubmit || isSubmitting, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Icon,
              {
                icon: isSubmitting ? "spinner" : "send",
                className: clsx("size-4", { "animate-spin": isSubmitting })
              }
            ) }) })
          ] }) : null
        ] })
      }
    ) }),
    documents && documents.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-px w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-xs overflow-y-scroll px-sm py-xs", children: documents.map((document) => {
        const files = document.payload.files;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "has-[button[data-delete]:hover]:bg-red-background relative z-0 flex flex-col rounded-sm", children: files.map((file, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "z-10 grid grid-cols-[auto_1fr_auto_20px] gap-sm p-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "attachment", className: "text-grey-secondary size-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: file.filename }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnnotationFileDownload, { annotationId: document.id, fileId: file.id }),
          idx === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "data-delete": true, className: "size-5", onClick: () => setAnnotationToDelete(document), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "text-red-primary size-5" }) }) : null
        ] }, file.id)) }) }, document.id);
      }) })
    ] }) : null,
    annotationToDelete ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      RemoveFileAnnotation,
      {
        annotation: annotationToDelete,
        onClose: () => setAnnotationToDelete(null),
        onDelete: () => {
          onAnnotateSuccess?.();
        }
      }
    ) : null
  ] });
}
const useIntersection = (ref, options) => {
  const [intersectionObserverEntry, setIntersectionObserverEntry] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (ref.current && typeof IntersectionObserver === "function") {
      const handler = (entries) => {
        setIntersectionObserverEntry(entries[0] ?? null);
      };
      const observer = new IntersectionObserver(handler, options);
      observer.observe(ref.current);
      return () => {
        setIntersectionObserverEntry(null);
        observer.disconnect();
      };
    }
  }, [ref.current, options.threshold, options.root, options.rootMargin]);
  return intersectionObserverEntry;
};
function useClientObjectListQuery(params) {
  const listObjects = useServerFn(listObjectsFn);
  return useInfiniteQuery({
    queryKey: ["resources", "data-list-object", params.tableName, params.params],
    queryFn: async ({ pageParam }) => {
      return listObjects({
        data: {
          tableName: params.tableName,
          ...params.params,
          ...pageParam !== null ? { offsetId: pageParam } : {}
        }
      });
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.clientDataListResponse.pagination.nextCursorId;
    },
    enabled: !!params.tableName
  });
}
function ClientDocumentsList({ documents }) {
  const { t: t2 } = useTranslation(["cases", "common"]);
  const files = documents.flatMap((d) => d.payload.files);
  const filesCount = files.length;
  const filesRest = Math.max(filesCount - 2, 0);
  const displayedFiles = files.slice(0, 2);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs text-xs", children: [
    displayedFiles.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "border-grey-border bg-surface-card flex h-6 max-w-24 items-center gap-2xs rounded-md border px-sm font-medium",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "attachment", className: "size-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: doc.filename })
        ]
      },
      doc.id
    )),
    filesRest > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border bg-surface-card flex h-6 items-center gap-2xs rounded-md border px-sm font-medium", children: t2("cases:annotations.documents.plus", { count: filesRest }) }) : null
  ] });
}
function ClientTagsEditSelect({
  caseId,
  tableName,
  objectId,
  annotations,
  onAnnotateSuccess
}) {
  const { t: t$1 } = useTranslation(["cases", "common"]);
  const { orgObjectTags } = useOrganizationObjectTags();
  const createAnnotationMutation = useCreateAnnotationMutation();
  const tags = annotations.map((annotation) => annotation.payload.tag_id);
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      caseId,
      tableName,
      objectId,
      type: "tag",
      payload: {
        tags
      }
    },
    validators: {
      onSubmit: tagAnnotationFormSchema
    },
    onSubmit({ value }) {
      const addedTags = value.payload.tags.filter((t2) => !tags.includes(t2));
      const removedAnnotations = annotations.filter((annotation) => {
        return !value.payload.tags.includes(annotation.payload.tag_id);
      });
      createAnnotationMutation.mutateAsync({
        tableName,
        objectId,
        caseId,
        type: "tag",
        payload: {
          addedTags,
          removedAnnotations: removedAnnotations.map((annotation) => annotation.id)
        }
      }).then((result) => {
        revalidate();
        if (result.success) {
          onAnnotateSuccess?.();
        } else {
          zt.error(t$1("common:errors.unknown"));
        }
      }).catch(() => {
        zt.error(t$1("common:errors.unknown"));
      });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      form.Field,
      {
        name: "payload.tags",
        validators: {
          onChange: tagAnnotationFormSchema._def.right.shape.payload.shape.tags,
          onBlur: tagAnnotationFormSchema._def.right.shape.payload.shape.tags
        },
        children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
          orgObjectTags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuCommand.Item,
            {
              value: tag.id,
              onSelect: () => field.handleChange((prev) => toggle(prev, tag.id)),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TagPreview, { name: tag.name }),
                field.state.value.includes(tag.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "text-purple-primary size-5" }) : null
              ]
            },
            tag.id
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Empty, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: t$1("cases:case_detail.add_a_tag.empty") }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (state) => [t(state.values.payload.tags, tags), state.isSubmitting], children: ([isDefaultValue, isSubmitting]) => !isDefaultValue ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border flex justify-end gap-sm overflow-x-auto border-t p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.HeadlessItem, { children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { mode: "icon", type: "submit", disabled: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-4 animate-spin" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", type: "submit", children: "Confirm" }) }) }) : null })
  ] });
}
function ClientTagsList({ tagsIds }) {
  const { orgObjectTags } = useOrganizationObjectTags();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-sm", children: tagsIds.map((tagId) => {
    const tag = orgObjectTags.find((t2) => t2.id === tagId);
    if (!tag) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "purple", size: "small", children: tag.name }, tagId);
  }) });
}
function CommentItem({ comment }) {
  const { getOrgUserById } = useOrganizationUsers();
  const user = reactExports.useMemo(
    () => comment.annotated_by ? getOrgUserById(comment.annotated_by) : void 0,
    [comment.annotated_by, getOrgUserById]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { firstName: user?.firstName, lastName: user?.lastName, size: "xs", color: "grey" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-sm pt-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", children: comment.payload.text }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xs text-grey-secondary text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: comment.created_at }) })
    ] })
  ] });
}
function ClientObjectComments({ comments, className }) {
  const { t: t2 } = useTranslation(["cases", "common"]);
  const [expanded, setExpanded] = reactExports.useState(false);
  const firstComment = comments[0];
  const lastComment = comments[comments.length - 1];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("relative z-0 flex flex-col text-xs", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-0 flex h-full w-6 flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border -z-10 h-full w-px" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[24px_1fr] gap-sm", children: comments.length > 2 && !expanded ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      firstComment ? /* @__PURE__ */ jsxRuntimeExports.jsx(CommentItem, { comment: firstComment }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setExpanded(true), className: "text-left font-semibold underline", children: t2("cases:annotations.comments.see_others", { count: comments.length - 2 }) })
      ] }),
      lastComment ? /* @__PURE__ */ jsxRuntimeExports.jsx(CommentItem, { comment: lastComment }) : null
    ] }) : comments.map((comment) => /* @__PURE__ */ jsxRuntimeExports.jsx(CommentItem, { comment }, comment.id)) })
  ] });
}
function ClientObjectAnnotationPopover({
  caseId,
  tableName,
  objectId,
  annotations
}) {
  const queryClient = useQueryClient();
  const [editTagsOpen, setEditTagsOpen] = reactExports.useState(false);
  const [editDocumentsOpen, setEditDocumentsOpen] = reactExports.useState(false);
  const documents = annotations?.files ?? [];
  const tagsAnnotations = annotations?.tags ?? [];
  const { t: t2 } = useTranslation(["cases"]);
  const handleAnnotateSuccess = useCallbackRef(() => {
    queryClient.invalidateQueries({ queryKey: ["resources", "data-list-object", tableName] });
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnnotationSection, { title: t2("cases:annotations.tags.title"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientTagsList, { tagsIds: tagsAnnotations.map((annotation) => annotation.payload.tag_id) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { persistOnSelect: true, open: editTagsOpen, onOpenChange: setEditTagsOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { mode: "icon", variant: "secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "text-grey-secondary size-3.5" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { side: "right", align: "start", sideOffset: 4, collisionPadding: 10, className: "w-[340px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ClientTagsEditSelect,
          {
            caseId,
            tableName,
            objectId,
            annotations: tagsAnnotations,
            onAnnotateSuccess: () => {
              handleAnnotateSuccess();
              setEditTagsOpen(false);
            }
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-px" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnnotationSection, { title: t2("cases:annotations.documents.title"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientDocumentsList, { documents }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { persistOnSelect: true, open: editDocumentsOpen, onOpenChange: setEditDocumentsOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { mode: "icon", variant: "secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "text-grey-secondary size-3.5" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { side: "right", align: "start", sideOffset: 4, collisionPadding: 10, className: "w-[340px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ClientDocumentsPopover,
          {
            caseId,
            tableName,
            objectId,
            documents,
            onAnnotateSuccess: () => {
              handleAnnotateSuccess();
              setEditDocumentsOpen(false);
            }
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-px" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnnotationSection, { title: "Annotations", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientObjectComments, { comments: annotations?.comments ?? [] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-px" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClientCommentForm,
      {
        caseId,
        tableName,
        objectId,
        onAnnotateSuccess: handleAnnotateSuccess
      }
    )
  ] });
}
function AnnotationSection({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-md pb-xs pt-sm text-xs font-semibold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[400px] overflow-y-scroll px-md pb-sm pt-xs", children })
  ] });
}
const CHARACTER_WIDTH = 8;
const DEFAULT_CELL_WIDTH = 300;
function DataTableRender({ caseId, dataModel, item, navigateTo }) {
  const { t: t2 } = useTranslation(["common", "cases"]);
  const currentTable = dataModel.find((t22) => t22.name === item.targetTableName);
  const sourceField = item.sourceObject[item.sourceFieldName];
  const filterFieldValue = typeof sourceField === "string" || typeof sourceField === "number" ? sourceField : "";
  const dataListQuery = useClientObjectListQuery({
    tableName: item.targetTableName,
    params: {
      sourceTableName: item.sourceTableName,
      filterFieldName: item.filterFieldName,
      filterFieldValue,
      orderingFieldName: item.orderingFieldName
    }
  });
  if (!currentTable) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-red-primary bg-red-background text-red-primary mt-md rounded-sm border p-sm", children: t2("common:global_error") });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-md flex min-h-0 flex-1 flex-col", children: M(dataListQuery).with({ isError: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-red-primary bg-red-background text-red-primary mt-md rounded-sm border p-sm", children: t2("common:global_error") });
  }).with({ isPending: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Loading list of objects..." });
  }).otherwise((query) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        caseId,
        pivotObject: item.pivotObject,
        table: currentTable,
        navigateTo,
        list: query.data.pages.flatMap((page) => page.clientDataListResponse.data),
        metadata: query.data.pages.reduce(
          (mergedMetadata, page) => {
            if (!page.clientDataListResponse.metadata) return mergedMetadata;
            if (!mergedMetadata) return page.clientDataListResponse.metadata;
            return {
              ...mergedMetadata,
              ...page.clientDataListResponse.metadata
            };
          },
          void 0
        ),
        pagination: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataTablePagination,
          {
            hasNext: query.hasNextPage,
            isLoading: query.isFetchingNextPage,
            onNext: () => {
              query.fetchNextPage();
            }
          }
        )
      }
    );
  }) });
}
function DataTablePagination({ hasNext, isLoading, onNext }) {
  const { t: t2 } = useTranslation(["common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: hasNext ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "small", onClick: onNext, disabled: isLoading, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-up", className: "size-4 rotate-180" }),
    t2("common:load_more_results")
  ] }) : null });
}
function getColumnList(tableModel) {
  return tableModel.fields.filter((f) => !f.hidden).map((f) => f.name);
}
function getHeaderStyle(fieldStatistic) {
  if (!fieldStatistic) return void 0;
  return M(fieldStatistic).with({ type: "Timestamp" }, () => ({ minWidth: "160px" })).with({ type: "IpAddress" }, () => ({ minWidth: "160px" })).with({ type: "Coords" }, () => ({ minWidth: "160px" })).with({ type: "Bool" }, () => ({ minWidth: "50px" })).with({ type: "String", format: "uuid" }, () => ({ minWidth: "100px" })).with({ type: z.union("String", "Float") }, ({ maxLength }) => ({
    minWidth: (maxLength !== void 0 ? CHARACTER_WIDTH * maxLength : DEFAULT_CELL_WIDTH) + "px"
  })).exhaustive();
}
const ROW_NUMBER_COL_WIDTH = 50;
const DEFAULT_PINNED_COL_WIDTH = 150;
const INITIAL_COLUMN_PINNING = { left: [], right: [] };
const columnHelper = createColumnHelper();
function DataTable({ caseId, pivotObject, table, list, metadata, pagination, navigateTo }) {
  const { t: t2 } = useTranslation(["common", "cases"]);
  const [columnList, setColumnList] = reactExports.useState(() => {
    return getColumnList(table);
  });
  const [columnPinning, setColumnPinning] = reactExports.useState(INITIAL_COLUMN_PINNING);
  const tableData = reactExports.useMemo(() => list.map((d) => d.data), [list]);
  const wrapperRef = reactExports.useRef(null);
  const sentinelRef = reactExports.useRef(null);
  const headerRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const rowNumberColRef = reactExports.useRef(null);
  const intersection = useIntersection(sentinelRef, {
    root: wrapperRef.current,
    rootMargin: "1px",
    threshold: 1
  });
  reactExports.useEffect(() => {
    setColumnList(getColumnList(table));
    setColumnPinning(INITIAL_COLUMN_PINNING);
  }, [table]);
  const columns = reactExports.useMemo(() => {
    return columnList.map((colName) => {
      return columnHelper.accessor(colName, {
        header: () => colName,
        cell: (info) => {
          const parsedData = parseUnknownData(info.getValue());
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn("relative line-clamp-1 px-sm", {
                "text-right": parsedData.type === "number" || parsedData.value === null
              }),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormatData, { type: table.fields.find((f) => f.name === colName)?.dataType, data: parsedData })
            }
          );
        }
      });
    });
  }, [columnList, table]);
  const reactTable = useReactTable({
    state: {
      columnOrder: table.fieldOrder,
      columnPinning
    },
    onColumnPinningChange: setColumnPinning,
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel()
  });
  const pinnedLeft = columnPinning.left ?? [];
  const getPinnedColumnOffset = (columnId) => {
    const idx = pinnedLeft.indexOf(columnId);
    if (idx < 0) return 0;
    const rowNumWidth = rowNumberColRef.current?.getBoundingClientRect().width ?? ROW_NUMBER_COL_WIDTH;
    let offset = rowNumWidth;
    for (let i = 0; i < idx; i++) {
      const pinnedColId = pinnedLeft[i];
      if (!pinnedColId) continue;
      const el = headerRefs.current.get(pinnedColId);
      offset += el?.getBoundingClientRect().width ?? DEFAULT_PINNED_COL_WIDTH;
    }
    return offset;
  };
  const isLastPinnedColumn = (columnId) => {
    return pinnedLeft[pinnedLeft.length - 1] === columnId;
  };
  const handleToggleColumn = (colName) => {
    setColumnList((cl) => {
      if (cl.includes(colName)) {
        setColumnPinning((prev) => ({
          ...prev,
          left: (prev.left ?? []).filter((c) => c !== colName)
        }));
        const idx = cl.indexOf(colName);
        return [...cl.slice(0, idx), ...cl.slice(idx + 1)];
      } else {
        return [...cl, colName];
      }
    });
  };
  const handleTogglePin = (colName) => {
    setColumnPinning((prev) => {
      const left = prev.left ?? [];
      if (left.includes(colName)) {
        return { ...prev, left: left.filter((c) => c !== colName) };
      }
      return { ...prev, left: [...left, colName] };
    });
  };
  const hasPinnedColumns = pinnedLeft.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-0 flex-1 flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-m font-semibold", children: table.name }),
      list.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-3.5", icon: "column" }),
          t2("cases:data_explorer.columns")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sideOffset: 4, align: "start", sameWidth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: table.fieldOrder.map((fieldName) => {
          const isPinned = pinnedLeft.includes(fieldName);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { onSelect: () => handleToggleColumn(fieldName), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fieldName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  role: "button",
                  tabIndex: 0,
                  className: cn(
                    "flex items-center justify-center rounded p-2xs hover:bg-grey-background-light",
                    isPinned ? "text-purple-primary" : "text-grey-secondary"
                  ),
                  onClick: (e) => {
                    e.stopPropagation();
                    handleTogglePin(fieldName);
                  },
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      handleTogglePin(fieldName);
                    }
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "map-pin", className: "size-3.5" })
                }
              ),
              columnList.includes(fieldName) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "size-5" }) : null
            ] })
          ] }) }, fieldName);
        }) }) })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-0 flex-1 overflow-auto", ref: wrapperRef, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: sentinelRef, className: "w-0" }),
      list.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "mb-md border-separate border-spacing-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: reactTable.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            className: "text-grey-secondary border-grey-border bg-surface-card sticky top-0 z-20 h-10 text-left",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "th",
                {
                  ref: rowNumberColRef,
                  className: cn(
                    "border-grey-border bg-surface-card sticky left-0 z-30 border-y border-r p-sm font-normal",
                    {
                      "shadow-sticky-left overflow-y-hidden": !intersection?.isIntersecting && !hasPinnedColumns
                    }
                  )
                }
              ),
              headerGroup.headers.map((header) => {
                const fieldStatistic = metadata?.fieldStatistics[header.getContext().column.id];
                const isPinned = header.column.getIsPinned();
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "th",
                  {
                    ref: (el) => {
                      if (el) headerRefs.current.set(header.column.id, el);
                      else headerRefs.current.delete(header.column.id);
                    },
                    className: cn(
                      "border-grey-border border-y px-xs font-normal not-last:border-r box-border group/th",
                      {
                        "sticky z-30 bg-surface-card border-r": isPinned,
                        "shadow-sticky-left": isPinned && isLastPinnedColumn(header.column.id) && !intersection?.isIntersecting
                      }
                    ),
                    style: {
                      left: isPinned ? `${getPinnedColumnOffset(header.column.id)}px` : void 0,
                      ...getHeaderStyle(fieldStatistic)
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext()) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          "aria-label": isPinned ? t2("cases:data_explorer.unpin_column") : t2("cases:data_explorer.pin_column"),
                          className: cn(
                            "shrink-0 transition-opacity",
                            isPinned ? "text-purple-primary opacity-100" : "opacity-0 group-hover/th:opacity-100 text-grey-secondary"
                          ),
                          onClick: () => handleTogglePin(header.column.id),
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "map-pin", className: "size-3" })
                        }
                      )
                    ] })
                  },
                  header.id
                );
              })
            ]
          },
          headerGroup.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: reactTable.getRowModel().rows.map((row) => {
          const fullSourceObject = list.find((item) => item.data === row.original);
          if (!fullSourceObject) {
            return null;
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-grey-border group z-0 h-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "td",
              {
                className: cn(
                  "border-grey-border bg-surface-card group-hover:bg-grey-background-light sticky left-0 z-10 h-full border-b border-r p-sm",
                  {
                    "shadow-sticky-left overflow-y-hidden": !intersection?.isIntersecting && !hasPinnedColumns
                  }
                ),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-sm", children: [
                  row.index + 1,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    DataTableActionsButton,
                    {
                      caseId,
                      navigationOptions: table.navigationOptions,
                      pivotObject,
                      sourceObject: fullSourceObject,
                      tableName: table.name,
                      navigateTo
                    }
                  )
                ] })
              }
            ),
            row.getVisibleCells().map((cell) => {
              const isPinned = cell.column.getIsPinned();
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "td",
                {
                  className: cn(
                    "border-grey-border group-hover:bg-grey-background-light border-b not-last:border-r",
                    {
                      "sticky z-10 bg-surface-card border-r": isPinned,
                      "shadow-sticky-left": isPinned && isLastPinnedColumn(cell.column.id) && !intersection?.isIntersecting
                    }
                  ),
                  style: {
                    left: isPinned ? `${getPinnedColumnOffset(cell.column.id)}px` : void 0
                  },
                  children: flexRender(cell.column.columnDef.cell, cell.getContext())
                },
                cell.id
              );
            })
          ] }, row.id);
        }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border rounded-sm border p-sm text-center", children: t2("cases:data_explorer.no_table_data", { tableName: table.name }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-sm", children: pagination })
  ] });
}
function DataTableActionsButton({
  caseId,
  navigationOptions,
  pivotObject,
  sourceObject,
  tableName,
  navigateTo
}) {
  const { t: t2 } = useTranslation(["cases", "common"]);
  const [annotationMenuOpen, setAnnotationMenuOpen] = reactExports.useState(false);
  const annotations = sourceObject.annotations ?? { files: [], comments: [], tags: [] };
  const annotationsCount = annotations.comments.length + annotations.files.length + annotations.tags.length;
  const showCommentAction = annotationsCount > 0 || annotationMenuOpen;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Root, { open: annotationMenuOpen, onOpenChange: setAnnotationMenuOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Anchor, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex", children: [
    showCommentAction ? /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "secondary",
        size: "small",
        className: "hover:border-purple-primary data-[state=open]:border-purple-primary items-center rounded-r-none hover:z-10 data-[state=open]:z-10",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "comment", className: "size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal", children: annotationsCount })
        ]
      }
    ) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Popover.Content,
      {
        side: "right",
        align: "start",
        sideOffset: 4,
        collisionPadding: 10,
        className: "max-h-none w-[340px]",
        children: sourceObject.data.object_id ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          ClientObjectAnnotationPopover,
          {
            caseId,
            tableName,
            objectId: sourceObject.data.object_id,
            annotations: sourceObject.annotations
          }
        ) : null
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "secondary",
          mode: showCommentAction ? "normal" : "icon",
          className: cn(
            "hover:border-purple-primary data-[state=open]:border-purple-primary hover:z-10 data-[state=open]:z-10",
            {
              "-ms-px rounded-l-none": showCommentAction
            }
          ),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "more-menu", className: "size-3.5" })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { side: "right", align: "start", sideOffset: 4, className: "text-r min-w-[280px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
        sourceObject.metadata.canBeAnnotated ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Group, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Item, { forceMount: true, onSelect: () => setAnnotationMenuOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
              t2("cases:annotations.popover.annotate.title"),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-disabled text-xs", children: annotationsCount })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: t2("cases:annotations.popover.annotate.subtitle") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "comment", className: "size-5" })
        ] }) }) : null,
        navigationOptions ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Separator, { className: "bg-grey-border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MenuCommand.Group,
            {
              heading: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-xs py-xs text-xs font-semibold", children: t2("cases:case_detail.pivot_panel.explore") }),
              children: navigationOptions.map((navigationOption) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                MenuCommand.Item,
                {
                  forceMount: true,
                  onSelect: () => {
                    navigateTo({
                      pivotObject,
                      sourceObject: sourceObject.data,
                      navigationOptionId: navigationOption.id,
                      sourceTableName: tableName,
                      sourceFieldName: navigationOption.sourceFieldName,
                      filterFieldName: navigationOption.filterFieldName,
                      targetTableName: navigationOption.targetTableName,
                      orderingFieldName: navigationOption.orderingFieldName
                    });
                  },
                  children: [
                    navigationOption.targetTableName,
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "north-east", className: "size-5" })
                  ]
                },
                navigationOption.id
              ))
            }
          )
        ] }) : null
      ] }) })
    ] })
  ] }) }) });
}
const DataModelExplorerContext = createSimpleContext("DataModelExplorer");
function DataModelExplorerProvider({ children }) {
  const [explorerState, _setExplorerState] = reactExports.useState(null);
  const startNavigation = reactExports.useCallback(
    (tab) => {
      _setExplorerState({
        closedTabsHistory: [],
        currentTab: tab,
        lastActiveTab: null,
        tabs: [tab]
      });
    },
    [_setExplorerState]
  );
  const setExplorerState = reactExports.useCallback(
    (partialState) => {
      _setExplorerState((state) => {
        if (state === null || partialState === null) return null;
        return { ...state, ...partialState };
      });
    },
    [_setExplorerState]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DataModelExplorerContext.Provider, { value: { explorerState, startNavigation, setExplorerState }, children });
}
function getTabUniqValue(tab) {
  const sourceId = tab.sourceObject[tab.sourceFieldName];
  return `${tab.sourceTableName}_${tab.sourceFieldName}_${sourceId ?? "unknown"}_${tab.targetTableName}_${tab.filterFieldName}_${tab.orderingFieldName}`;
}
function findTabWithUniqValue(tabUniqValue) {
  return (tab) => tabUniqValue === getTabUniqValue(tab);
}
function DataModelExplorer(props) {
  const explorerContext = DataModelExplorerContext.useValue();
  const reopenClosedTab = useCallbackRef((tabUniqValue) => {
    if (!explorerContext.explorerState) return;
    const closedTabsHistory2 = explorerContext.explorerState.closedTabsHistory;
    const closedTabIndex = closedTabsHistory2.findIndex(findTabWithUniqValue(tabUniqValue));
    if (closedTabIndex < 0) return;
    const closedTab = closedTabsHistory2[closedTabIndex];
    if (!closedTab) return;
    const newClosedHistory = [
      ...closedTabsHistory2.slice(0, closedTabIndex),
      ...closedTabsHistory2.slice(closedTabIndex + 1)
    ];
    explorerContext.setExplorerState({
      closedTabsHistory: newClosedHistory,
      tabs: [...tabs, closedTab],
      lastActiveTab: explorerContext.explorerState.currentTab,
      currentTab: closedTab
    });
  });
  const addTab = useCallbackRef((newTab) => {
    if (!explorerContext.explorerState) return;
    const newTabUniqValue = getTabUniqValue(newTab);
    const existingTab = explorerContext.explorerState.tabs.find(findTabWithUniqValue(newTabUniqValue));
    if (existingTab) {
      explorerContext.setExplorerState({
        ...explorerContext.explorerState,
        lastActiveTab: explorerContext.explorerState.currentTab,
        currentTab: existingTab
      });
      return;
    }
    const existingClosedTab = explorerContext.explorerState.closedTabsHistory.find(
      findTabWithUniqValue(newTabUniqValue)
    );
    if (existingClosedTab) {
      reopenClosedTab(newTabUniqValue);
      return;
    }
    explorerContext.setExplorerState({
      tabs: [...explorerContext.explorerState.tabs, newTab],
      lastActiveTab: explorerContext.explorerState.currentTab,
      currentTab: newTab
    });
  });
  const closeTab = useCallbackRef((tab) => {
    const nextState = {};
    const tabIndex = tabs.indexOf(tab);
    if (tabIndex < 0) {
      return;
    }
    if (tab === currentTab) {
      const nextTab = lastActiveTab ?? tabs[tabIndex + 1] ?? tabs[tabIndex - 1];
      if (nextTab) {
        nextState.lastActiveTab = null;
        nextState.currentTab = nextTab;
      }
    }
    const nextTabsState = [...tabs.slice(0, tabIndex), ...tabs.slice(tabIndex + 1)];
    if (nextTabsState.length === 0) {
      explorerContext.setExplorerState(null);
    }
    nextState.closedTabsHistory = [...closedTabsHistory, tab];
    nextState.tabs = nextTabsState;
    explorerContext.setExplorerState(nextState);
  });
  if (!explorerContext.explorerState) {
    return null;
  }
  const { currentTab, lastActiveTab, closedTabsHistory, tabs } = explorerContext.explorerState;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto py-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-0 flex-1 flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "before:bg-grey-border relative py-xs pe-md0 before:absolute before:inset-x-0 before:bottom-0 before:h-px", children: [
      tabs.map((tab) => {
        const tabUniqValue = getTabUniqValue(tab);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataModelExplorerTab,
          {
            current: tab === currentTab,
            label: `${tab.targetTableName}`,
            onClick: () => {
              explorerContext.setExplorerState({
                lastActiveTab: currentTab,
                currentTab: tab
              });
            },
            onClose: () => {
              closeTab(tab);
            }
          },
          tabUniqValue
        );
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TabBarActions,
        {
          className: "absolute right-2 top-2",
          options: [
            {
              label: "Reopen last closed tab",
              value: "open_last_closed",
              disabled: closedTabsHistory.length === 0
            }
          ],
          onSelect: (opt) => {
            switch (opt) {
              case "open_last_closed": {
                const tab = closedTabsHistory[closedTabsHistory.length - 1];
                if (!tab) return;
                reopenClosedTab(getTabUniqValue(tab));
                break;
              }
            }
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-0 flex-1 flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableRender, { caseId: props.caseId, item: currentTab, dataModel: props.dataModel, navigateTo: addTab }) })
  ] }) });
}
function DataModelExplorerTab(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: props.current ? "purple" : "grey", size: "big", className: "cursor-pointer gap-sm", onClick: props.onClick, children: [
    props.label,
    props.current && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Icon,
      {
        icon: "cross",
        className: "size-3.5",
        onClick: (e) => {
          e.stopPropagation();
          props.onClose?.();
        }
      }
    )
  ] });
}
function TabBarActions(props) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { mode: "icon", variant: "secondary", className: props.className, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "more-menu", className: "size-3.5" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "end", sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: props.options.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { disabled: opt.disabled, onSelect: () => props.onSelect(opt.value), children: opt.label }, opt.value)) }) })
  ] });
}
export {
  ClientTagsList as C,
  DataModelExplorerContext as D,
  ClientTagsEditSelect as a,
  DataModelExplorerProvider as b,
  ClientDocumentsPopover as c,
  DataModelExplorer as d,
  ClientDocumentsList as e,
  ClientObjectComments as f,
  useIntersection as u
};
