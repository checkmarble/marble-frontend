import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { n as number, O as availableFeatures } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn } from "../server.js";
import { o as object, j as uuid, p as boolean, s as string, _ as _enum, l as discriminatedUnion, n as number$1, k as array, m as literal } from "./short-uuid-MIi3jWzx.js";
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
  threshold: number$1().min(0).max(100).optional(),
  limit: number$1().min(10).max(50).optional()
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
  threshold: number$1().min(0).max(100).optional(),
  limit: number$1().min(10).max(50).optional()
}), object({
  entityType: literal("Organization"),
  fields: object({
    name: string().min(1),
    country: string().optional(),
    registrationNumber: string().optional(),
    address: string().optional()
  }),
  datasets: array(string()).optional(),
  threshold: number$1().min(0).max(100).optional(),
  limit: number$1().min(10).max(50).optional()
}), object({
  entityType: literal("Vehicle"),
  fields: object({
    name: string().min(1),
    registrationNumber: string().optional()
  }),
  datasets: array(string()).optional(),
  threshold: number$1().min(0).max(100).optional(),
  limit: number$1().min(10).max(50).optional()
})]);
const getEnrichedDataInputSchema = object({
  entityId: string()
});
const savedSearchFiltersSchema = object({
  createdAfter: string().optional(),
  createdBefore: string().optional(),
  offsetId: string().optional(),
  limit: number().min(1).max(100).optional(),
  userId: string().optional(),
  apiKeyId: string().optional(),
  isSaved: boolean().optional()
});
const getAvailableFiltersSchema = object({
  feature: _enum(availableFeatures)
});
const getListConfigFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(getAvailableFiltersSchema).handler(createSsrRpc("0515540a9075d9867aa221b0ea91f83ba7c6617449361ef13176b8b3939332a1"));
const getScreeningAiSuggestionsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  screeningId: string()
})).handler(createSsrRpc("0d92ca36925f6c91df4f2d997376bca39f97a888df1a52aa719837221dfd77f4"));
const getScreeningDetailFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  decisionId: string(),
  screeningId: string()
})).handler(createSsrRpc("d9f50a6ec4d0650a079b61e35c1e787e77c62b9d1229d6056ac3d33412b1c4f3"));
const enrichMatchFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  matchId: string()
})).handler(createSsrRpc("99f4389ef92108f1572f002e85ac7949c8a6a26370aa3122e995fd3bd27bca0d"));
createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(createSsrRpc("f250aa514e96b274017194a32a92cb6bb673f9b5e588acf4d4d62265e3a8f860"));
const searchScreeningMatchesFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(refineSearchSchema).handler(createSsrRpc("d7133cc4021ae7dfd97cb94f690467fe773bc29b8534fe756b9d992410e63545"));
const freeformSearchFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(freeformSearchSchema).handler(createSsrRpc("4dbe46c3c9bd4bb15e6f4100aca8694910e330b77268624364ca39804018b673"));
const saveFreeformSearchFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  id: uuid()
})).handler(createSsrRpc("b1dc2e1461471567ead26a6613de4a682628d8104ee743af22f44c67225a8e76"));
const listSavedFreeformSearchesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(savedSearchFiltersSchema).handler(createSsrRpc("628d5a1aeaf107fb0f5e48757f5f0b6ae0578a3d5aa8028d7af77aa34542f748"));
const getFreeformSearchFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  id: uuid()
})).handler(createSsrRpc("449b6eafbc6e1bc44a3878aa31db01de693fd82bd0e3d759dd1b60b63dc571fa"));
const getEnrichedDataFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(getEnrichedDataInputSchema).handler(createSsrRpc("a6ba1cd10eb1d07f91dba3a2fb2390c482352a27212ad29212b5cf30d4ff7aaa"));
const refineScreeningFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(refineSearchSchema).handler(createSsrRpc("45a15b57970ff33b01c0ebbd0ba0bcf29c83ea97d71194d00d80e6532ea954cc"));
const uploadScreeningFileFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(createSsrRpc("44d25eb624775f1892a7ce7644c35a875a5bdf082c0dd1fa25a0f3220f5b36ab"));
export {
  getFreeformSearchFn as a,
  getEnrichedDataFn as b,
  getScreeningDetailFn as c,
  getScreeningAiSuggestionsFn as d,
  enrichMatchFn as e,
  freeformSearchFn as f,
  getListConfigFn as g,
  refineScreeningFn as h,
  searchScreeningMatchesFn as i,
  listSavedFreeformSearchesFn as l,
  refineSearchSchema as r,
  saveFreeformSearchFn as s,
  uploadScreeningFileFn as u
};
