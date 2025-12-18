import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { M as MAX_FILE_SIZE } from "./useFormDropzone-BjTKexsf.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { H as isNotFoundHttpError, b as captureException, I as isStatusConflictHttpError, y as useAuthSession, M, g as getServerEnv } from "./services-middleware-DR8Hua1Y.js";
import { c as createAnnotationPayloadSchema } from "./annotations-DpAN3M8g.js";
import { l as listObjectsInputSchema, c as createTableValueSchema, d as deleteTablePayloadSchema, a as createNavigationOptionSchema, b as applyArchetypePayloadSchema, e as editSemanticTablePayloadSchema } from "./data-fdG1PpsD.js";
import { g as getTableMutationError } from "./table-mutation-errors-DAbLsi0Q.js";
import { d as getClientAnnotationFileUploadEndpoint, e as getIngestionDataBatchUploadEndpoint } from "./files-fO9wUXBf.js";
import { o as omitUndefined } from "./omit-undefined-_jZUo5xa.js";
import { _ as createServerFn, a4 as getRequest } from "../server.js";
import { d as decode } from "./index-Lgs0msFa.js";
import { t as tryit } from "./async-C3pYACua.js";
import { o as object, s as string, p as boolean, t as treeifyError, e as unknown } from "./short-uuid-MIi3jWzx.js";
import "./use-callback-ref-DXzIzfqy.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const getDataModelFn_createServerFn_handler = createServerRpc({
  id: "6944613ffe0aa02bb2c4f5e334213d5ca9ee34cfdc427416708cf528d68ff3f2",
  name: "getDataModelFn",
  filename: "src/server-fns/data.ts"
}, (opts) => getDataModelFn.__executeServer(opts));
const getDataModelFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(getDataModelFn_createServerFn_handler, async ({
  context
}) => {
  const dataModel = await context.authInfo.dataModelRepository.getDataModel();
  return {
    dataModel
  };
});
const getObjectDetailsFn_createServerFn_handler = createServerRpc({
  id: "1efcd86b2bc7895d3981a5ebe0f645d5664ddd40ee87753a56ad300d6f336347",
  name: "getObjectDetailsFn",
  filename: "src/server-fns/data.ts"
}, (opts) => getObjectDetailsFn.__executeServer(opts));
const getObjectDetailsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string(),
  objectId: string()
})).handler(getObjectDetailsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.dataModelRepository.getIngestedObject(data.objectType, data.objectId);
});
const getObjectCasesFn_createServerFn_handler = createServerRpc({
  id: "e6229feca3b3fb85b41ab0891207d4614d4bb03b4efa764297cd88ad37d290fb",
  name: "getObjectCasesFn",
  filename: "src/server-fns/data.ts"
}, (opts) => getObjectCasesFn.__executeServer(opts));
const getObjectCasesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string(),
  objectId: string()
})).handler(getObjectCasesFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const cases = await context.authInfo.dataModelRepository.getCasesForObject(data.objectType, data.objectId);
  return {
    cases
  };
});
const getAnnotationsFn_createServerFn_handler = createServerRpc({
  id: "2e2c44dea917bd6673dd566a86500b4714ee81ec707b56dd2a1e439ef390befb",
  name: "getAnnotationsFn",
  filename: "src/server-fns/data.ts"
}, (opts) => getAnnotationsFn.__executeServer(opts));
const getAnnotationsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string(),
  objectId: string(),
  loadThumbnails: boolean().optional()
})).handler(getAnnotationsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const annotations = await context.authInfo.dataModelRepository.getAnnotationsByTableNameAndObjectId(data.objectType, data.objectId, data.loadThumbnails ?? false);
  return {
    annotations
  };
});
const getHierarchyFn_createServerFn_handler = createServerRpc({
  id: "45cc9be38ba9c9cbbde847284a880e1a3b298e1cb0709facd5ac322c439440dc",
  name: "getHierarchyFn",
  filename: "src/server-fns/data.ts"
}, (opts) => getHierarchyFn.__executeServer(opts));
const getHierarchyFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string(),
  objectId: string(),
  showAll: boolean().optional()
})).handler(getHierarchyFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    dataModelRepository
  } = context.authInfo;
  const {
    objectType,
    objectId
  } = data;
  const dataModel = await dataModelRepository.getDataModel();
  const baseObject = await dataModelRepository.getIngestedObject(objectType, objectId);
  const baseObjectTable = dataModel.find((table) => table.name === objectType);
  if (!baseObjectTable) {
    throw new Error(`Object type '${objectType}' not found`);
  }
  const baseObjectHierarchyNode = {
    objectType,
    objectId,
    data: baseObject.data,
    children: [],
    parents: []
  };
  const baseObjectParentsTables = dataModel.flatMap((table) => table.linksToSingle).filter((link) => link.childTableName === objectType);
  await retrieveChildren(objectType, baseObject, baseObjectTable.navigationOptions, dataModelRepository, baseObjectHierarchyNode);
  for (const link of baseObjectParentsTables) {
    if (link.parentFieldName !== "object_id") continue;
    const fieldValue = baseObject.data[link.childFieldName];
    if (typeof fieldValue !== "string" && typeof fieldValue !== "number") continue;
    const parentTableName = link.parentTableName;
    const parentObjectTable = dataModel.find((table) => table.name === parentTableName);
    if (!parentObjectTable) continue;
    try {
      const parentObject = await dataModelRepository.getIngestedObject(parentTableName, baseObject.data[link.childFieldName]);
      const parentObjectHierarchyNode = {
        objectType: link.parentTableName,
        objectId: parentObject.data["object_id"],
        data: parentObject.data,
        children: []
      };
      if (data.showAll) {
        await retrieveChildren(link.parentTableName, parentObject, parentObjectTable.navigationOptions, dataModelRepository, parentObjectHierarchyNode);
      }
      baseObjectHierarchyNode.parents.push(parentObjectHierarchyNode);
    } catch (error) {
      if (!isNotFoundHttpError(error)) {
        captureException(error);
      }
    }
  }
  return {
    hierarchy: baseObjectHierarchyNode
  };
});
const listObjectsFn_createServerFn_handler = createServerRpc({
  id: "a935492b06b3339671752674985c2bdbb3884594169301f4e22811733e16cf72",
  name: "listObjectsFn",
  filename: "src/server-fns/data.ts"
}, (opts) => listObjectsFn.__executeServer(opts));
const listObjectsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(listObjectsInputSchema).handler(listObjectsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    tableName,
    sourceTableName,
    filterFieldName,
    filterFieldValue,
    orderingFieldName,
    limit,
    offsetId
  } = data;
  const clientDataListResponse = await context.authInfo.dataModelRepository.listClientObjects({
    tableName,
    body: {
      explorationOptions: {
        sourceTableName,
        filterFieldName,
        filterFieldValue,
        orderingFieldName
      },
      ...limit !== void 0 ? {
        limit
      } : {},
      ...offsetId !== void 0 ? {
        offsetId
      } : {}
    }
  });
  return {
    clientDataListResponse
  };
});
const listArchetypesFn_createServerFn_handler = createServerRpc({
  id: "3409b04d1702a2d8544171e712f454ccb429ad4e30ec126fa85586fb5307674a",
  name: "listArchetypesFn",
  filename: "src/server-fns/data.ts"
}, (opts) => listArchetypesFn.__executeServer(opts));
const listArchetypesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(listArchetypesFn_createServerFn_handler, async ({
  context
}) => {
  const {
    archetypes
  } = await context.authInfo.apiClient.listArchetypes();
  return archetypes;
});
const createTableFn_createServerFn_handler = createServerRpc({
  id: "bffc3c813284c52f2a760b5057ce15887502aa1fd8b7ea49cc9a49bc9d30a25d",
  name: "createTableFn",
  filename: "src/server-fns/data.ts"
}, (opts) => createTableFn.__executeServer(opts));
const createTableFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createTableValueSchema).handler(createTableFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const request = getRequest();
  const t = await context.services.i18nextService.getFixedT(request, ["common", "data"]);
  try {
    return await context.authInfo.dataModelRepository.createTable(data);
  } catch (error) {
    const mutError = getTableMutationError(error, t, {
      conflictMessage: isStatusConflictHttpError(error) ? t("common:errors.data.duplicate_table_name") : void 0
    });
    throw mutError;
  }
});
const deleteTableFn_createServerFn_handler = createServerRpc({
  id: "620c46bfa3baf7db386208078056700c83bd9579d70242df23c44c39513b8006",
  name: "deleteTableFn",
  filename: "src/server-fns/data.ts"
}, (opts) => deleteTableFn.__executeServer(opts));
const deleteTableFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteTablePayloadSchema).handler(deleteTableFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const request = getRequest();
  const t = await context.services.i18nextService.getFixedT(request, ["common"]);
  try {
    return context.authInfo.dataModelRepository.deleteTable(data.tableId, {
      perform: data.perform
    });
  } catch (error) {
    const mutError = getTableMutationError(error, t);
    throw mutError;
  }
});
const createNavigationOptionFn_createServerFn_handler = createServerRpc({
  id: "2ae2f8aa739bc87b26179633dd7ab394f8ba7bc4489dbfa180c1f1922def10cd",
  name: "createNavigationOptionFn",
  filename: "src/server-fns/data.ts"
}, (opts) => createNavigationOptionFn.__executeServer(opts));
const createNavigationOptionFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  tableId: string(),
  ...createNavigationOptionSchema.shape
})).handler(createNavigationOptionFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    tableId,
    ...options
  } = data;
  try {
    await context.authInfo.dataModelRepository.createNavigationOption(tableId, options);
    return {
      success: true
    };
  } catch (err) {
    if (isStatusConflictHttpError(err)) {
      return {
        status: "error",
        error: "duplicate_pivot_value"
      };
    }
    throw new Error("Failed to create navigation option");
  }
});
const applyArchetypeFn_createServerFn_handler = createServerRpc({
  id: "8576e3c08aa7eeb60ef13888c99a08b2c94a9ccb2011e4b79e4a2747c8bd8e34",
  name: "applyArchetypeFn",
  filename: "src/server-fns/data.ts"
}, (opts) => applyArchetypeFn.__executeServer(opts));
const applyArchetypeFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(applyArchetypePayloadSchema).handler(applyArchetypeFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.apiClient.applyArchetype({
      name: data.name
    }, {});
    return {
      success: true
    };
  } catch {
    return {
      success: false
    };
  }
});
const editSemanticTableFn_createServerFn_handler = createServerRpc({
  id: "15091ae1ff83a56dbe3c9e2f02f6284aa0e95fb9f939e3a6a080396c6d923a78",
  name: "editSemanticTableFn",
  filename: "src/server-fns/data.ts"
}, (opts) => editSemanticTableFn.__executeServer(opts));
const editSemanticTableFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editSemanticTablePayloadSchema).handler(editSemanticTableFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const request = getRequest();
  const t = await context.services.i18nextService.getFixedT(request, ["common", "data"]);
  try {
    const patchBody = omitUndefined({
      description: data.description,
      semantic_type: data.semantic_type,
      caption_field: data.caption_field,
      alias: data.alias,
      ftm_entity: data.ftm_entity,
      primary_ordering_field: data.primary_ordering_field,
      fields: data.fields,
      links: data.links,
      metadata: data.metadata
    });
    await context.authInfo.dataModelRepository.patchDataModelTable(data.tableId, patchBody);
  } catch (error) {
    const mutError = getTableMutationError(error, t);
    throw mutError;
  }
});
const createAnnotationFn_createServerFn_handler = createServerRpc({
  id: "bc39d831a3856af2a4d01bab1899d09c170fbc1cf3aff927b17e4b81eeb25232",
  name: "createAnnotationFn",
  filename: "src/server-fns/data.ts"
}, (opts) => createAnnotationFn.__executeServer(opts));
const createAnnotationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(createAnnotationFn_createServerFn_handler, async ({
  context,
  data: formData
}) => {
  const request = getRequest();
  const authSession = await useAuthSession();
  const [err, raw] = await tryit(async (req) => {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      throw new Error("File too large");
    }
    return formData;
  })(request);
  if (err) {
    return {
      success: false,
      error: "file_too_large"
    };
  }
  const token = authSession.data.authToken?.access_token;
  if (!token) throw new Error("Not authenticated");
  const {
    data: parsedData,
    success,
    error
  } = createAnnotationPayloadSchema.safeParse(decode(raw, {
    arrays: ["payload.files", "payload.addedTags", "payload.removedAnnotations", "payload.addedCategories"]
  }));
  if (!success) {
    return {
      success: false,
      errors: treeifyError(error)
    };
  }
  try {
    return await M(parsedData).with({
      type: "comment"
    }, async ({
      payload: {
        text
      },
      ...d
    }) => {
      await context.authInfo.dataModelRepository.createAnnotation(d.tableName, d.objectId, {
        type: "comment",
        caseId: d.caseId,
        payload: {
          text
        }
      });
      return {
        success: true
      };
    }).with({
      type: "tag"
    }, async ({
      payload: {
        addedTags = [],
        removedAnnotations = []
      },
      ...d
    }) => {
      await Promise.all([...addedTags.map((tagAdded) => context.authInfo.dataModelRepository.createAnnotation(d.tableName, d.objectId, {
        type: "tag",
        caseId: d.caseId,
        payload: {
          tagId: tagAdded
        }
      })), ...removedAnnotations.map((annotationId) => context.authInfo.dataModelRepository.deleteAnnotation(annotationId))]);
      return {
        success: true
      };
    }).with({
      type: "risk_tag"
    }, async ({
      payload: {
        addedCategories = [],
        removedAnnotations = []
      },
      ...d
    }) => {
      await Promise.all([...addedCategories.map((categoryAdded) => context.authInfo.dataModelRepository.createAnnotation(d.tableName, d.objectId, {
        type: "risk_tag",
        caseId: d.caseId,
        payload: {
          tag: categoryAdded
        }
      })), ...removedAnnotations.map((annotationId) => context.authInfo.dataModelRepository.deleteAnnotation(annotationId))]);
      return {
        success: true
      };
    }).with({
      type: "file"
    }, async ({
      payload: {
        files
      },
      ...d
    }) => {
      if (files.length > 0) {
        const body = new FormData();
        body.append("caption", "File annotation");
        if (d.caseId) body.append("case_id", d.caseId);
        files.forEach((file) => body.append("files[]", file));
        const endpoint = getClientAnnotationFileUploadEndpoint(d.tableName, d.objectId);
        const response = await fetch(`${getServerEnv("MARBLE_API_URL")}${endpoint}`, {
          method: "POST",
          body,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status !== 200) throw response;
      }
      return {
        success: true
      };
    }).exhaustive();
  } catch {
    throw new Error("Failed to create annotation");
  }
});
const deleteAnnotationFn_createServerFn_handler = createServerRpc({
  id: "1f1e07f6140177e3b7e1ee29119c29aa561583b5f4d305e63b5293ce6fba7c16",
  name: "deleteAnnotationFn",
  filename: "src/server-fns/data.ts"
}, (opts) => deleteAnnotationFn.__executeServer(opts));
const deleteAnnotationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  annotationId: string()
})).handler(deleteAnnotationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.dataModelRepository.deleteAnnotation(data.annotationId);
    return {
      success: true
    };
  } catch {
    return {
      success: false,
      errors: []
    };
  }
});
const uploadIngestionDataFn_createServerFn_handler = createServerRpc({
  id: "b8cfaed4b661eb58e1126fc2c19a1941d14bbee462adcfaf38d21c8ad608b5f5",
  name: "uploadIngestionDataFn",
  filename: "src/server-fns/data.ts"
}, (opts) => uploadIngestionDataFn.__executeServer(opts));
const uploadIngestionDataFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(uploadIngestionDataFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const objectType = data.get("objectType");
  if (!objectType) return new Response(null, {
    status: 400
  });
  const token = await context.authInfo.tokenService.getToken();
  const backendData = new FormData();
  for (const [key, value] of data.entries()) {
    if (key !== "objectType") backendData.append(key, value);
  }
  const upstream = await fetch(`${getServerEnv("MARBLE_API_URL")}${getIngestionDataBatchUploadEndpoint(objectType)}`, {
    body: backendData,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const headers = new Headers(upstream.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  const body = [204, 205, 304].includes(upstream.status) ? null : await upstream.arrayBuffer();
  return new Response(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers
  });
});
const getUploadLogsFn_createServerFn_handler = createServerRpc({
  id: "dba1c1f220424954a6cba811e467fc7cef5967c34fb495cfa073a4df63df92da",
  name: "getUploadLogsFn",
  filename: "src/server-fns/data.ts"
}, (opts) => getUploadLogsFn.__executeServer(opts));
const getUploadLogsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string()
})).handler(getUploadLogsFn_createServerFn_handler, async ({
  context,
  data: {
    objectType
  }
}) => {
  return context.authInfo.apiClient.getIngestionUploadLogs(objectType);
});
const importOrgFn_createServerFn_handler = createServerRpc({
  id: "df48532154d9db27d92642acee665ab62e9a530971387ef6d65669994da54b1d",
  name: "importOrgFn",
  filename: "src/server-fns/data.ts"
}, (opts) => importOrgFn.__executeServer(opts));
const importOrgFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  body: unknown()
})).handler(importOrgFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.organization.importOrganization(data.body);
    return {
      success: true,
      message: "Import successful"
    };
  } catch (error) {
    console.error("[import-org] Import failed:", error);
    return {
      success: false,
      message: error?.data?.message ?? error?.message ?? "Import failed"
    };
  }
});
const importOrgFileFn_createServerFn_handler = createServerRpc({
  id: "e34efea5d0fd04848729b9d6a16c0c9deebf709db40984ac8169287e71fb45b7",
  name: "importOrgFileFn",
  filename: "src/server-fns/data.ts"
}, (opts) => importOrgFileFn.__executeServer(opts));
const importOrgFileFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(importOrgFileFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const file = data.get("file");
  if (!(file instanceof Blob)) {
    return {
      success: false,
      message: "Cannot read file"
    };
  }
  try {
    await context.authInfo.organization.importOrganizationFromFile(file);
    return {
      success: true,
      message: "Import successful"
    };
  } catch (error) {
    console.error("[import-org-file] Import failed:", error);
    return {
      success: false,
      message: error?.data?.message ?? error?.message ?? "Import failed"
    };
  }
});
async function retrieveChildren(objectType, object2, navigationOptions, dataModelRepository, hierarchyNode) {
  if (!navigationOptions) return;
  for (const navigationOption of navigationOptions) {
    const requestBody = {
      explorationOptions: {
        sourceTableName: objectType,
        filterFieldName: navigationOption.filterFieldName,
        filterFieldValue: object2.data[navigationOption.sourceFieldName],
        orderingFieldName: navigationOption.orderingFieldName
      },
      limit: 5
    };
    const data = await dataModelRepository.listClientObjects({
      tableName: navigationOption.targetTableName,
      body: requestBody
    });
    if (data.data.length === 0) continue;
    hierarchyNode.children.push({
      objectType: navigationOption.targetTableName,
      navigationOptionId: navigationOption.id,
      data: data.data.map((item) => item.data)
    });
  }
}
export {
  applyArchetypeFn_createServerFn_handler,
  createAnnotationFn_createServerFn_handler,
  createNavigationOptionFn_createServerFn_handler,
  createTableFn_createServerFn_handler,
  deleteAnnotationFn_createServerFn_handler,
  deleteTableFn_createServerFn_handler,
  editSemanticTableFn_createServerFn_handler,
  getAnnotationsFn_createServerFn_handler,
  getDataModelFn_createServerFn_handler,
  getHierarchyFn_createServerFn_handler,
  getObjectCasesFn_createServerFn_handler,
  getObjectDetailsFn_createServerFn_handler,
  getUploadLogsFn_createServerFn_handler,
  importOrgFileFn_createServerFn_handler,
  importOrgFn_createServerFn_handler,
  listArchetypesFn_createServerFn_handler,
  listObjectsFn_createServerFn_handler,
  uploadIngestionDataFn_createServerFn_handler
};
