import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { n as number$1, O as availableFeatures, I as isStatusConflictHttpError, g as getServerEnv } from "./services-middleware-DR8Hua1Y.js";
import { a as getScreeningFileUploadEndpoint } from "./files-fO9wUXBf.js";
import { _ as createServerFn } from "../server.js";
import { l as discriminatedUnion, o as object, s as string, m as literal, j as uuid, n as number, k as array, p as boolean, _ as _enum } from "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const refineSearchSchema = discriminatedUnion("entityType", [object({
  screeningId: uuid(),
  entityType: literal("Thing"),
  fields: object({
    name: string().optional()
  })
}), object({
  screeningId: uuid(),
  entityType: literal("Person"),
  fields: object({
    name: string().optional(),
    birthDate: string().optional(),
    nationality: string().optional(),
    passportNumber: string().optional(),
    address: string().optional()
  })
}), object({
  screeningId: uuid(),
  entityType: literal("Organization"),
  fields: object({
    name: string().optional(),
    country: string().optional(),
    registrationNumber: string().optional(),
    address: string().optional()
  })
}), object({
  screeningId: uuid(),
  entityType: literal("Vehicle"),
  fields: object({
    name: string().optional(),
    registrationNumber: string().optional()
  })
})]);
const freeformSearchSchema = discriminatedUnion("entityType", [object({
  entityType: literal("Thing"),
  fields: object({
    name: string().min(1)
  }),
  datasets: array(string()).optional(),
  threshold: number().min(0).max(100).optional(),
  limit: number().min(10).max(50).optional()
}), object({
  entityType: literal("Person"),
  fields: object({
    name: string().min(1),
    birthDate: string().optional(),
    nationality: string().optional(),
    passportNumber: string().optional(),
    address: string().optional()
  }),
  datasets: array(string()).optional(),
  threshold: number().min(0).max(100).optional(),
  limit: number().min(10).max(50).optional()
}), object({
  entityType: literal("Organization"),
  fields: object({
    name: string().min(1),
    country: string().optional(),
    registrationNumber: string().optional(),
    address: string().optional()
  }),
  datasets: array(string()).optional(),
  threshold: number().min(0).max(100).optional(),
  limit: number().min(10).max(50).optional()
}), object({
  entityType: literal("Vehicle"),
  fields: object({
    name: string().min(1),
    registrationNumber: string().optional()
  }),
  datasets: array(string()).optional(),
  threshold: number().min(0).max(100).optional(),
  limit: number().min(10).max(50).optional()
})]);
const getEnrichedDataInputSchema = object({
  entityId: string()
});
const savedSearchFiltersSchema = object({
  createdAfter: string().optional(),
  createdBefore: string().optional(),
  offsetId: string().optional(),
  limit: number$1().min(1).max(100).optional(),
  userId: string().optional(),
  apiKeyId: string().optional(),
  isSaved: boolean().optional()
});
const getAvailableFiltersSchema = object({
  feature: _enum(availableFeatures)
});
const getListConfigFn_createServerFn_handler = createServerRpc({
  id: "0515540a9075d9867aa221b0ea91f83ba7c6617449361ef13176b8b3939332a1",
  name: "getListConfigFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => getListConfigFn.__executeServer(opts));
const getListConfigFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(getAvailableFiltersSchema).handler(getListConfigFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const filter = await context.authInfo.screening.getAvailableFilters({
    feature: data.feature
  });
  return filter;
});
const getScreeningAiSuggestionsFn_createServerFn_handler = createServerRpc({
  id: "0d92ca36925f6c91df4f2d997376bca39f97a888df1a52aa719837221dfd77f4",
  name: "getScreeningAiSuggestionsFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => getScreeningAiSuggestionsFn.__executeServer(opts));
const getScreeningAiSuggestionsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  screeningId: string()
})).handler(getScreeningAiSuggestionsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const suggestions = await context.authInfo.screening.getAiSuggestions({
    screeningId: data.screeningId
  });
  return {
    suggestions
  };
});
const getScreeningDetailFn_createServerFn_handler = createServerRpc({
  id: "d9f50a6ec4d0650a079b61e35c1e787e77c62b9d1229d6056ac3d33412b1c4f3",
  name: "getScreeningDetailFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => getScreeningDetailFn.__executeServer(opts));
const getScreeningDetailFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  decisionId: string(),
  screeningId: string()
})).handler(getScreeningDetailFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const screenings = await context.authInfo.screening.listScreenings({
    decisionId: data.decisionId
  });
  const screeningItem = screenings.find((s) => s.id === data.screeningId);
  if (!screeningItem) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  return {
    screening: screeningItem
  };
});
const enrichMatchFn_createServerFn_handler = createServerRpc({
  id: "99f4389ef92108f1572f002e85ac7949c8a6a26370aa3122e995fd3bd27bca0d",
  name: "enrichMatchFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => enrichMatchFn.__executeServer(opts));
const enrichMatchFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  matchId: string()
})).handler(enrichMatchFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.screening.enrichMatch({
      matchId: data.matchId
    });
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      return {
        error: "already_enriched"
      };
    }
    throw new Error("Failed to enrich match");
  }
});
const getScreeningDatasetsFn_createServerFn_handler = createServerRpc({
  id: "f250aa514e96b274017194a32a92cb6bb673f9b5e588acf4d4d62265e3a8f860",
  name: "getScreeningDatasetsFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => getScreeningDatasetsFn.__executeServer(opts));
const getScreeningDatasetsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(getScreeningDatasetsFn_createServerFn_handler, async ({
  context
}) => {
  const datasets = await context.authInfo.screening.listDatasets();
  return {
    datasets
  };
});
const searchScreeningMatchesFn_createServerFn_handler = createServerRpc({
  id: "d7133cc4021ae7dfd97cb94f690467fe773bc29b8534fe756b9d992410e63545",
  name: "searchScreeningMatchesFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => searchScreeningMatchesFn.__executeServer(opts));
const searchScreeningMatchesFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(refineSearchSchema).handler(searchScreeningMatchesFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return await context.authInfo.screening.searchScreeningMatches(data);
});
const freeformSearchFn_createServerFn_handler = createServerRpc({
  id: "4dbe46c3c9bd4bb15e6f4100aca8694910e330b77268624364ca39804018b673",
  name: "freeformSearchFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => freeformSearchFn.__executeServer(opts));
const freeformSearchFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(freeformSearchSchema).handler(freeformSearchFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const result = await context.authInfo.screening.freeformSearch(data);
    return result;
  } catch (error) {
    console.error(`Freeform search error (${data})`, error);
    throw new Error("Freeform search failed");
  }
});
const saveFreeformSearchFn_createServerFn_handler = createServerRpc({
  id: "b1dc2e1461471567ead26a6613de4a682628d8104ee743af22f44c67225a8e76",
  name: "saveFreeformSearchFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => saveFreeformSearchFn.__executeServer(opts));
const saveFreeformSearchFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  id: uuid()
})).handler(saveFreeformSearchFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.screening.saveFreeformSearch(data);
  } catch {
    throw new Error("Save freeform search failed");
  }
});
const listSavedFreeformSearchesFn_createServerFn_handler = createServerRpc({
  id: "628d5a1aeaf107fb0f5e48757f5f0b6ae0578a3d5aa8028d7af77aa34542f748",
  name: "listSavedFreeformSearchesFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => listSavedFreeformSearchesFn.__executeServer(opts));
const listSavedFreeformSearchesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(savedSearchFiltersSchema).handler(listSavedFreeformSearchesFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const page = await context.authInfo.screening.listSavedScreeningSearches(data);
    return page;
  } catch {
    throw new Error("List saved searches failed");
  }
});
const getFreeformSearchFn_createServerFn_handler = createServerRpc({
  id: "449b6eafbc6e1bc44a3878aa31db01de693fd82bd0e3d759dd1b60b63dc571fa",
  name: "getFreeformSearchFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => getFreeformSearchFn.__executeServer(opts));
const getFreeformSearchFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  id: uuid()
})).handler(getFreeformSearchFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const result = await context.authInfo.screening.getFreeformSearch(data);
    return result;
  } catch {
    throw new Error("Get freeform search failed");
  }
});
const getEnrichedDataFn_createServerFn_handler = createServerRpc({
  id: "a6ba1cd10eb1d07f91dba3a2fb2390c482352a27212ad29212b5cf30d4ff7aaa",
  name: "getEnrichedDataFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => getEnrichedDataFn.__executeServer(opts));
const getEnrichedDataFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(getEnrichedDataInputSchema).handler(getEnrichedDataFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const result = await context.authInfo.screening.enrichedData(data);
    return result;
  } catch {
    throw new Error("Enriched data failed");
  }
});
const refineScreeningFn_createServerFn_handler = createServerRpc({
  id: "45a15b57970ff33b01c0ebbd0ba0bcf29c83ea97d71194d00d80e6532ea954cc",
  name: "refineScreeningFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => refineScreeningFn.__executeServer(opts));
const refineScreeningFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(refineSearchSchema).handler(refineScreeningFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return await context.authInfo.screening.refineScreening(data);
});
const uploadScreeningFileFn_createServerFn_handler = createServerRpc({
  id: "44d25eb624775f1892a7ce7644c35a875a5bdf082c0dd1fa25a0f3220f5b36ab",
  name: "uploadScreeningFileFn",
  filename: "src/server-fns/screenings.ts"
}, (opts) => uploadScreeningFileFn.__executeServer(opts));
const uploadScreeningFileFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(uploadScreeningFileFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const screeningId = data.get("screeningId");
  if (!screeningId) return new Response(null, {
    status: 400
  });
  const token = await context.authInfo.tokenService.getToken();
  const backendData = new FormData();
  for (const [key, value] of data.entries()) {
    if (key !== "screeningId") backendData.append(key, value);
  }
  const upstream = await fetch(`${getServerEnv("MARBLE_API_URL")}${getScreeningFileUploadEndpoint(screeningId)}`, {
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
export {
  enrichMatchFn_createServerFn_handler,
  freeformSearchFn_createServerFn_handler,
  getEnrichedDataFn_createServerFn_handler,
  getFreeformSearchFn_createServerFn_handler,
  getListConfigFn_createServerFn_handler,
  getScreeningAiSuggestionsFn_createServerFn_handler,
  getScreeningDatasetsFn_createServerFn_handler,
  getScreeningDetailFn_createServerFn_handler,
  listSavedFreeformSearchesFn_createServerFn_handler,
  refineScreeningFn_createServerFn_handler,
  saveFreeformSearchFn_createServerFn_handler,
  searchScreeningMatchesFn_createServerFn_handler,
  uploadScreeningFileFn_createServerFn_handler
};
