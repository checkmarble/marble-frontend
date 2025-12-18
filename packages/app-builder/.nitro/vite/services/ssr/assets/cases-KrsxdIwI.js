import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { M as MY_INBOX_ID } from "./inboxes-D556s0BB.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { y as useAuthSession, g as getServerEnv, T as Temporal, I as isStatusConflictHttpError, J as protectArray, S as isStatusBadRequestHttpError, H as isNotFoundHttpError, b as captureException, Z as caseStatuses, u as t, _ as t$1, $ as t$2, v as n, o as t$3 } from "./services-middleware-DR8Hua1Y.js";
import { c as closeCasePayloadSchema, o as openCasePayloadSchema, e as escalateCasePayloadSchema, s as snoozeCasePayloadSchema, a as editAssigneePayloadSchema, b as editInboxPayloadSchema, d as editNamePayloadSchema, f as editTagsPayloadSchema, g as editSuspicionPayloadSchema, m as massUpdateCasesPayloadSchema, h as addCommentPayloadSchema, r as reviewDecisionPayloadSchema, i as addRuleSnoozePayloadSchema, j as reviewScreeningMatchPayloadSchema, k as addToCasePayloadSchema, l as listCasesInputSchema, n as listCaseDecisionsInputSchema, p as caseReviewReactionSchema, u as updateInboxEscalationPayloadSchema, q as updateAutoAssignPayloadSchema, t as updateInboxWorkflowPayloadSchema } from "./cases-PZYcTUxr.js";
import { c as getCaseFileUploadEndpoint } from "./files-fO9wUXBf.js";
import { o as object, j as uuid, s as string, b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, x as redirect, a4 as getRequest } from "../server.js";
import { d as decode } from "./index-Lgs0msFa.js";
import { t as tryit } from "./async-C3pYACua.js";
import { n as n$1 } from "./flat-BPaRpdYE.js";
import { n as n$2 } from "./unique-CBeBxAXx.js";
import { n as n$3 } from "./uniqueBy-Tn1hUkKJ.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const createCaseFn_createServerFn_handler = createServerRpc({
  id: "11e598f40e3c339bd47fba6cf665d373350c37e3b13fa68de8ff98eba6c21d45",
  name: "createCaseFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => createCaseFn.__executeServer(opts));
const createCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  name: string().min(1),
  inboxId: uuid()
})).handler(createCaseFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const createdCase = await context.authInfo.cases.createCase(data);
    throw redirect({
      to: "/cases/$caseId",
      params: {
        caseId: fromUUIDtoSUUID(createdCase.id)
      }
    });
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
    throw new Error("Failed to create case");
  }
});
const closeCaseFn_createServerFn_handler = createServerRpc({
  id: "aeb25831ddd4ebbae9b71adbb802ff454fa3049df29c01d8242dff7c101f760c",
  name: "closeCaseFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => closeCaseFn.__executeServer(opts));
const closeCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(closeCasePayloadSchema).handler(closeCaseFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    caseId,
    outcome,
    comment
  } = data;
  try {
    const promises = [context.authInfo.cases.updateCase({
      caseId,
      body: {
        status: "closed",
        outcome
      }
    })];
    if (comment !== "") {
      promises.push(context.authInfo.cases.addComment({
        caseId,
        body: {
          comment
        }
      }));
    }
    await Promise.all(promises);
  } catch {
    throw new Error("Failed to close case");
  }
});
const openCaseFn_createServerFn_handler = createServerRpc({
  id: "2227302e87f743feb0e67e5f03797a3ffb72d6c61a523caf5738aba781254d06",
  name: "openCaseFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => openCaseFn.__executeServer(opts));
const openCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(openCasePayloadSchema).handler(openCaseFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const promises = [];
    if (data.comment !== "") {
      promises.push(context.authInfo.cases.addComment({
        caseId: data.caseId,
        body: {
          comment: data.comment
        }
      }));
    }
    promises.push(context.authInfo.cases.updateCase({
      caseId: data.caseId,
      body: {
        status: "investigating"
      }
    }));
    await Promise.allSettled(promises);
  } catch {
    throw new Error("Failed to open case");
  }
});
const escalateCaseFn_createServerFn_handler = createServerRpc({
  id: "a761d2402c537f6119f0a5ca64f12931c80b8e766b7a69e364b5561d15156c3d",
  name: "escalateCaseFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => escalateCaseFn.__executeServer(opts));
const escalateCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(escalateCasePayloadSchema).handler(escalateCaseFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.cases.escalateCase({
      caseId: data.caseId
    });
    throw redirect({
      to: "/cases/inboxes/$inboxId",
      params: {
        inboxId: fromUUIDtoSUUID(data.inboxId)
      }
    });
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
    throw new Error("Failed to escalate case");
  }
});
const snoozeCaseFn_createServerFn_handler = createServerRpc({
  id: "1e9b661682fb912830b1f3efeaf46a1f996053f19f1f6f1a33dbd3a86b87f594",
  name: "snoozeCaseFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => snoozeCaseFn.__executeServer(opts));
const snoozeCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(snoozeCasePayloadSchema).handler(snoozeCaseFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await (data.snoozeUntil ? context.authInfo.cases.snoozeCase({
    caseId: data.caseId,
    snoozeUntil: data.snoozeUntil
  }) : context.authInfo.cases.unsnoozeCase(data));
});
const editAssigneeFn_createServerFn_handler = createServerRpc({
  id: "1512977eb13f2e4b814a9d34bba714914509115fec399ac6cc34510c92286ab4",
  name: "editAssigneeFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => editAssigneeFn.__executeServer(opts));
const editAssigneeFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editAssigneePayloadSchema).handler(editAssigneeFn_createServerFn_handler, async ({
  context,
  data
}) => {
  if (data.assigneeId) {
    await context.authInfo.cases.assignUser({
      caseId: data.caseId,
      userId: data.assigneeId
    });
  } else {
    await context.authInfo.cases.unassignUser({
      caseId: data.caseId
    });
  }
});
const editInboxFn_createServerFn_handler = createServerRpc({
  id: "831980953e257f0ca8cd51639d31164df1ab717173c5888527336df5f04bb689",
  name: "editInboxFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => editInboxFn.__executeServer(opts));
const editInboxFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editInboxPayloadSchema).handler(editInboxFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.cases.updateCase({
    caseId: data.caseId,
    body: {
      inboxId: data.inboxId
    }
  });
});
const editNameFn_createServerFn_handler = createServerRpc({
  id: "71b227037e9d2870a23391901108fa35fad4ad2916687fba8d82b11d83a3e0ff",
  name: "editNameFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => editNameFn.__executeServer(opts));
const editNameFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editNamePayloadSchema).handler(editNameFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.cases.updateCase({
    caseId: data.caseId,
    body: {
      name: data.name
    }
  });
});
const editTagsFn_createServerFn_handler = createServerRpc({
  id: "b0fc06ccceb6bbefac12913faef83bb4161aff5dc6c33399de4999681030364f",
  name: "editTagsFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => editTagsFn.__executeServer(opts));
const editTagsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editTagsPayloadSchema).handler(editTagsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.cases.setTags(data);
});
const editSuspicionFn_createServerFn_handler = createServerRpc({
  id: "2275538994b192abc19ce1c514973b6b313fe7aae4da2322f304af4da7b1dbc0",
  name: "editSuspicionFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => editSuspicionFn.__executeServer(opts));
const editSuspicionFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(editSuspicionFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const [err, raw] = await tryit(() => Promise.resolve(data))();
  if (err) {
    throw new Error("FormData error");
  }
  const parsed = editSuspicionPayloadSchema.safeParse(decode(raw));
  if (!parsed.success) throw new Error("Invalid payload");
  const formData = parsed.data;
  try {
    let sar = void 0;
    if (formData.reportId && formData.status === "none") {
      await context.authInfo.cases.deleteSuspiciousActivityReport({
        caseId: formData.caseId,
        reportId: formData.reportId
      });
    } else if (formData.reportId && formData.status !== "none") {
      sar = await context.authInfo.cases.updateSuspiciousActivityReport({
        caseId: formData.caseId,
        reportId: formData.reportId,
        body: {
          status: formData.status,
          ...formData.file && {
            file: formData.file
          }
        }
      });
    } else if (!formData.reportId && formData.status !== "none") {
      sar = await context.authInfo.cases.createSuspiciousActivityReport({
        caseId: formData.caseId,
        body: {
          status: formData.status,
          ...formData.file && {
            file: formData.file
          }
        }
      });
    } else {
      throw new Error("Should not happen");
    }
    return {
      success: true,
      errors: [],
      data: sar
    };
  } catch (error) {
    return {
      success: false,
      errors: [error.message]
    };
  }
});
const listSuspicionActivityReportsFn_createServerFn_handler = createServerRpc({
  id: "ded1573960426155c88bc40540df73cd6f691d9bbc236ec1cfed89b2e792d63a",
  name: "listSuspicionActivityReportsFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => listSuspicionActivityReportsFn.__executeServer(opts));
const listSuspicionActivityReportsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(listSuspicionActivityReportsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return await context.authInfo.cases.listSuspiciousActivityReports({
    caseId: data.caseId
  });
});
const massUpdateCasesFn_createServerFn_handler = createServerRpc({
  id: "e519385a986a1399e4d45bf7103b63f45a1eca15ff4ac1f5690d58dbb323fc40",
  name: "massUpdateCasesFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => massUpdateCasesFn.__executeServer(opts));
const massUpdateCasesFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(massUpdateCasesPayloadSchema).handler(massUpdateCasesFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.cases.massUpdateCases({
    body: data
  });
});
const addCommentFn_createServerFn_handler = createServerRpc({
  id: "589f847aaa1a3ef61540357f0aada39bc7f4543ff712b1eeeefaa030beba0ad5",
  name: "addCommentFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => addCommentFn.__executeServer(opts));
const addCommentFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(addCommentFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const [err, raw] = await tryit(() => Promise.resolve(data))();
  if (err) {
    throw new Error("FormData error");
  }
  const authSession = await useAuthSession();
  const token = authSession.data.authToken?.access_token;
  if (!token) throw redirect({
    to: "/sign-in",
    statusCode: 302
  });
  const parsed = addCommentPayloadSchema.safeParse(decode(raw, {
    arrays: ["files"]
  }));
  if (!parsed.success) throw new Error("Invalid payload");
  const formData = parsed.data;
  try {
    const promises = [];
    if (formData.comment !== "") {
      promises.push(context.authInfo.cases.addComment({
        caseId: formData.caseId,
        body: {
          comment: formData.comment
        }
      }));
    }
    if (formData.files.length > 0) {
      const body = new FormData();
      formData.files.forEach((file) => {
        body.append("file[]", file);
      });
      promises.push(fetch(`${getServerEnv("MARBLE_API_URL")}${getCaseFileUploadEndpoint(formData.caseId)}`, {
        method: "POST",
        body,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Failed to upload comment files");
        }
      }));
    }
    await Promise.all(promises);
  } catch {
    throw new Error("Failed to add comment");
  }
});
const reviewDecisionFn_createServerFn_handler = createServerRpc({
  id: "ed217e8bd8c1d51a0cd2a59be32b49e8fb2aee2d06075740a27474147bc64c21",
  name: "reviewDecisionFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => reviewDecisionFn.__executeServer(opts));
const reviewDecisionFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(reviewDecisionPayloadSchema).handler(reviewDecisionFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.cases.reviewDecision(data);
    return {
      status: "success"
    };
  } catch {
    return {
      status: "error"
    };
  }
});
const addRuleSnoozeFn_createServerFn_handler = createServerRpc({
  id: "717fe6d459f3c0141c67184aac743c50d7678af1c5599c4181484d9b0fda244b",
  name: "addRuleSnoozeFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => addRuleSnoozeFn.__executeServer(opts));
const addRuleSnoozeFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(addRuleSnoozePayloadSchema).handler(addRuleSnoozeFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const request = getRequest();
  const t2 = await context.services.i18nextService.getFixedT(request, ["common", "cases"]);
  const {
    decisionId,
    ruleId,
    comment,
    durationUnit,
    durationValue
  } = data;
  const duration = Temporal.Duration.from({
    [durationUnit]: durationValue
  });
  if (Temporal.Duration.compare(duration, Temporal.Duration.from({
    days: 180
  }), {
    relativeTo: Temporal.Now.plainDateTimeISO()
  }) >= 0) {
    return {
      status: "error",
      errors: [{
        durationValue: [t2("cases:case_detail.add_rule_snooze.errors.max_duration")]
      }]
    };
  }
  try {
    await context.authInfo.decision.createSnoozeForDecision(decisionId, {
      ruleId,
      duration,
      comment
    });
    return {
      status: "success",
      errors: []
    };
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      return {
        status: "error",
        errors: [],
        error: "duplicate_rule_snooze"
      };
    }
    return {
      status: "error",
      errors: []
    };
  }
});
const reviewScreeningMatchFn_createServerFn_handler = createServerRpc({
  id: "3f2cb24c490c45ed6617d17f08300a01526cd34abac3428fd6d0e6dd1ff2da74",
  name: "reviewScreeningMatchFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => reviewScreeningMatchFn.__executeServer(opts));
const reviewScreeningMatchFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(reviewScreeningMatchPayloadSchema).handler(reviewScreeningMatchFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.screening.updateMatchStatus(data);
  } catch {
    throw new Error("Failed to review screening match");
  }
});
const setAllMatchesToNoHitFn_createServerFn_handler = createServerRpc({
  id: "41481bc58996e49712fcc004313b6edff90b1f458957f10bc239a3f0d968e681",
  name: "setAllMatchesToNoHitFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => setAllMatchesToNoHitFn.__executeServer(opts));
const setAllMatchesToNoHitFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  matchIds: protectArray(string().array())
})).handler(setAllMatchesToNoHitFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await Promise.all(data.matchIds.map((matchId) => context.authInfo.screening.updateMatchStatus({
      matchId,
      status: "no_hit"
    })));
  } catch {
    throw new Error("Failed to review screening match");
  }
});
const addToCaseFn_createServerFn_handler = createServerRpc({
  id: "49be5c9418ff167bfeb32f5f00109527dcf7263db92f78d4b7c5effa6203d294",
  name: "addToCaseFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => addToCaseFn.__executeServer(opts));
const addToCaseFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(addToCasePayloadSchema).handler(addToCaseFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const request = getRequest();
  const t2 = await context.services.i18nextService.getFixedT(request, ["common", "cases"]);
  try {
    if (data.newCase) {
      return await context.authInfo.cases.createCase(data);
    } else {
      return await context.authInfo.cases.addDecisionsToCase(data);
    }
  } catch (error) {
    if (isStatusBadRequestHttpError(error)) {
      throw new Error(t2("common:errors.add_to_case.invalid"));
    } else if (isNotFoundHttpError(error)) {
      throw new Error(t2("cases:errors.case_not_found"));
    }
    throw new Error(t2("common:errors.unknown"));
  }
});
const getAiSettingsFn_createServerFn_handler = createServerRpc({
  id: "eaf635be3a78a47c8689038767b8f9301a191d87399a6025d82e173bda71a6f3",
  name: "getAiSettingsFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => getAiSettingsFn.__executeServer(opts));
const getAiSettingsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(getAiSettingsFn_createServerFn_handler, async ({
  context
}) => {
  const settings = await context.authInfo.aiAssistSettings.getAiAssistSettings();
  return {
    settings
  };
});
const updateAiSettingsFn_createServerFn_handler = createServerRpc({
  id: "adfc3f80bda8e9cd2aaa38540facec344ddfce65c5acce62ded2e403374ce950",
  name: "updateAiSettingsFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => updateAiSettingsFn.__executeServer(opts));
const updateAiSettingsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => data).handler(updateAiSettingsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.aiAssistSettings.updateAiAssistSettings(data);
  } catch (error) {
    captureException(error);
    throw new Error("Failed to update AI settings");
  }
});
const getInboxesFn_createServerFn_handler = createServerRpc({
  id: "ff3f275750e20031532404c4fa27e1be16278d0437a5907aeee79a0726aa8670",
  name: "getInboxesFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => getInboxesFn.__executeServer(opts));
const getInboxesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(getInboxesFn_createServerFn_handler, async ({
  context
}) => {
  const inboxes = await context.authInfo.inbox.listInboxesWithCaseCount();
  return {
    inboxes
  };
});
const getCaseDetailFn_createServerFn_handler = createServerRpc({
  id: "638113da6a614e62eb9cfde6084f9a695ec0f455f864401e97cbf9680f4f58b9",
  name: "getCaseDetailFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => getCaseDetailFn.__executeServer(opts));
const getCaseDetailFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(getCaseDetailFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const caseDetail = await context.authInfo.cases.getCase({
    caseId: data.caseId
  });
  return {
    caseDetail
  };
});
const getCaseNameFn_createServerFn_handler = createServerRpc({
  id: "414aee403d09219bd5b92225cb0dbcd1c444939c0987b5e50579c6c7495b151e",
  name: "getCaseNameFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => getCaseNameFn.__executeServer(opts));
const getCaseNameFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(getCaseNameFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const c = await context.authInfo.cases.getCase({
    caseId: data.caseId
  });
  return {
    name: c.name
  };
});
const getCasesFn_createServerFn_handler = createServerRpc({
  id: "6d86c7f155864d7d15da8da5213c501e2d5f184e15aca786db098a47b307800e",
  name: "getCasesFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => getCasesFn.__executeServer(opts));
const getCasesFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(listCasesInputSchema).handler(getCasesFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    inboxId,
    limit,
    order,
    offsetId,
    ...filters
  } = data;
  const {
    user,
    cases: caseRepository
  } = context.authInfo;
  const filterInboxIds = inboxId === MY_INBOX_ID ? void 0 : [inboxId];
  const assigneeIdFilter = filters.assignee ? {
    assigneeId: filters.assignee
  } : {};
  const statusesFilter = filters.statuses ?? caseStatuses.filter((status) => status !== "closed");
  return caseRepository.listCases({
    ...filters,
    ...limit ? {
      limit
    } : {},
    ...order ? {
      order
    } : {},
    ...offsetId ? {
      offsetId
    } : {},
    statuses: statusesFilter,
    inboxIds: filterInboxIds,
    ...filterInboxIds === void 0 ? {
      assigneeId: user.actorIdentity.userId
    } : assigneeIdFilter
  });
});
const getRelatedCasesByObjectFn_createServerFn_handler = createServerRpc({
  id: "9578f0945f70f45ec6b1514ebd9e2c58e82cea0a49e40bcdd2ec06401ff2260b",
  name: "getRelatedCasesByObjectFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => getRelatedCasesByObjectFn.__executeServer(opts));
const getRelatedCasesByObjectFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string(),
  objectId: string()
})).handler(getRelatedCasesByObjectFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const relatedCases = await context.authInfo.cases.getObjectRelatedCases(data);
  return {
    cases: relatedCases
  };
});
const getPivotRelatedCasesFn_createServerFn_handler = createServerRpc({
  id: "a98fd3361b7ced97078a718642448473da394f6499cd5f725003946a4fb4d6ce",
  name: "getPivotRelatedCasesFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => getPivotRelatedCasesFn.__executeServer(opts));
const getPivotRelatedCasesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  pivotValue: string()
})).handler(getPivotRelatedCasesFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const cases = await context.authInfo.cases.getPivotRelatedCases({
    pivotValue: data.pivotValue
  });
  return {
    cases
  };
});
const listCaseDecisionsFn_createServerFn_handler = createServerRpc({
  id: "59a7650a5227dc2800373a38230e6720a235df16dbcf1b12e55dcb573e0f3a19",
  name: "listCaseDecisionsFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => listCaseDecisionsFn.__executeServer(opts));
const listCaseDecisionsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(listCaseDecisionsInputSchema).handler(listCaseDecisionsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.cases.listCaseDecisions({
    caseId: data.caseId
  }, {
    limit: data.limit ?? 200,
    cursorId: data.cursorId
  });
});
const getRulesByPivotFn_createServerFn_handler = createServerRpc({
  id: "282f535518ae8a27880adef26c748090828e7284eabdc7e963339dd9a086f594",
  name: "getRulesByPivotFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => getRulesByPivotFn.__executeServer(opts));
const getRulesByPivotFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(getRulesByPivotFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    cases: caseRepository,
    decision: decisionRepository,
    scenarioIterationRuleRepository
  } = context.authInfo;
  const caseDetail = await caseRepository.getCase({
    caseId: data.caseId
  });
  const iterationRules = await getScenarioIterationsRules(caseDetail.decisions, scenarioIterationRuleRepository);
  const [decisionsDetails, snoozes] = await Promise.all([enrichDecisions(caseDetail.decisions, decisionRepository, iterationRules), getDecisionsSnoozes(caseDetail.decisions, decisionRepository)]);
  const rulesByPivot = t(decisionsDetails, n((decision) => !!decision.pivotValues[0]?.value), t$2((decision) => decision.pivotValues[0].value), t$1((decisions, pivotValue) => {
    const snoozesForPivot = snoozes.filter((s) => s.pivotValue === pivotValue);
    return getRulesForSnooze(decisions, snoozesForPivot);
  }));
  return {
    rulesByPivot
  };
});
async function enrichDecisions(decisions, repository, iterationRules) {
  return Promise.all(decisions.map((decision) => repository.getDecisionById(decision.id).then((decisionDetail) => enrichRules(decisionDetail, iterationRules))));
}
async function enrichRules(decisionDetail, iterationRules) {
  return {
    ...decisionDetail,
    rules: decisionDetail.rules.map((rule) => ({
      ...rule,
      ruleGroup: iterationRules.find((r) => r.id === rule.ruleId)?.ruleGroup
    }))
  };
}
async function getDecisionsSnoozes(decisions, repository) {
  return Promise.all(decisions.map((decision) => repository.getDecisionActiveSnoozes(decision.id).then((r) => r.ruleSnoozes))).then((ruleSnoozesArrays) => n$1(ruleSnoozesArrays));
}
async function getScenarioIterationsRules(decisions, repository) {
  const uniqueScenarioIterationIds = n$2(decisions.map((decision) => decision.scenario.scenarioIterationId));
  return Promise.all(uniqueScenarioIterationIds.map((scenarioIterationId) => repository.listRules({
    scenarioIterationId
  }))).then((rulesArrays) => n$1(rulesArrays));
}
function getRulesForSnooze(decisions, snoozes) {
  const enrichedRulesArray = t$3(decisions, (decision) => decision.rules.map((rule) => ({
    ...rule,
    hitAt: decision.createdAt,
    decisionId: decision.id
  })));
  const enrichedRules = t(n$1(enrichedRulesArray), n$3((rule) => rule.ruleId));
  return t$3(enrichedRules, (rule) => {
    const ruleSnooze = snoozes.find((s) => s.ruleId === rule.ruleId);
    if (ruleSnooze) {
      return {
        ...rule,
        isSnoozed: true,
        start: ruleSnooze.startsAt,
        end: ruleSnooze.endsAt
      };
    }
    return {
      ...rule,
      isSnoozed: false,
      start: void 0,
      end: void 0
    };
  });
}
const listCaseReviewsFn_createServerFn_handler = createServerRpc({
  id: "e82e5e029e7551fe42617eac4de94cff4306ffdf6e7eb17491c10229cf7ce1fc",
  name: "listCaseReviewsFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => listCaseReviewsFn.__executeServer(opts));
const listCaseReviewsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(listCaseReviewsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const reviews = await context.authInfo.cases.listCaseReviews({
    caseId: data.caseId
  });
  return {
    reviews
  };
});
const getCaseReviewFn_createServerFn_handler = createServerRpc({
  id: "a507f66df206343c0cbfa5cb1e2979f7807ec4b4075ed7bffc2845395c2f1389",
  name: "getCaseReviewFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => getCaseReviewFn.__executeServer(opts));
const getCaseReviewFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string(),
  reviewId: string()
})).handler(getCaseReviewFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const review = await context.authInfo.cases.getCaseReviewById({
    caseId: data.caseId,
    reviewId: data.reviewId
  });
  return {
    review
  };
});
const enqueueReviewFn_createServerFn_handler = createServerRpc({
  id: "73d50d04b2d129e99c6df2d999e7261c56ca37cbc22971d21142d884f5129541",
  name: "enqueueReviewFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => enqueueReviewFn.__executeServer(opts));
const enqueueReviewFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(enqueueReviewFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.cases.enqueueReviewForCase({
    caseId: data.caseId
  });
});
const addCaseReviewFeedbackFn_createServerFn_handler = createServerRpc({
  id: "85a181416467a2a8d2e38f7c5f19dd32902af84a24705bb810477f7c5c63a1ad",
  name: "addCaseReviewFeedbackFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => addCaseReviewFeedbackFn.__executeServer(opts));
const addCaseReviewFeedbackFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  caseId: string(),
  reviewId: string(),
  reaction: caseReviewReactionSchema
})).handler(addCaseReviewFeedbackFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.cases.addCaseReviewFeedback({
    caseId: data.caseId,
    reviewId: data.reviewId,
    reaction: data.reaction
  });
});
const addReviewToCaseCommentsFn_createServerFn_handler = createServerRpc({
  id: "a596d5a955719e10577b334de37fcc87ab4a008f47ea0fa506612b1d56199816",
  name: "addReviewToCaseCommentsFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => addReviewToCaseCommentsFn.__executeServer(opts));
const addReviewToCaseCommentsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  caseId: string(),
  reviewId: string()
})).handler(addReviewToCaseCommentsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const caseReviews = await context.authInfo.cases.getMostRecentCaseReview({
    caseId: data.caseId
  });
  const caseReview = caseReviews.find((review) => review.id === data.reviewId);
  if (!caseReview) throw new Error("Review not found");
  try {
    await context.authInfo.cases.addComment({
      caseId: data.caseId,
      body: {
        comment: caseReview.review.output
      }
    });
  } catch {
    throw new Error("Failed to add review to case comments");
  }
});
function enrichAnalysisWithLinks(enrichments) {
  return enrichments.map((enrichment) => {
    let updatedAnalysis = enrichment.analysis;
    updatedAnalysis = updatedAnalysis.replace(/\[(\d+)\]/g, (match, numStr) => {
      const index = parseInt(numStr, 10) - 1;
      const citation = enrichment.citations[index];
      if (citation && citation.url) {
        const safeTitle = citation.title.replace(/"/g, "'");
        return `[[${numStr}]](${citation.url} "${safeTitle}")`;
      }
      return match;
    });
    return {
      ...enrichment,
      analysis: updatedAnalysis
    };
  });
}
const enrichKycFn_createServerFn_handler = createServerRpc({
  id: "0e2334bbb8b7b4da8996b3da2eeccc089d1a6bc709d1825f329d799946a18335",
  name: "enrichKycFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => enrichKycFn.__executeServer(opts));
const enrichKycFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(enrichKycFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const kycCaseEnrichments = await context.authInfo.cases.enrichPivotObjectOfCaseWithKyc({
      caseId: data.caseId
    });
    if (!kycCaseEnrichments) throw new Error("KYC enrichment not found");
    return {
      success: true,
      kycCaseEnrichments: enrichAnalysisWithLinks(kycCaseEnrichments)
    };
  } catch (error) {
    console.error("Error enriching KYC", error);
    const status = error?.status || 500;
    const message = error?.message || "Error enriching KYC";
    throw new Error(JSON.stringify({
      code: status,
      message
    }));
  }
});
const updateInboxEscalationFn_createServerFn_handler = createServerRpc({
  id: "239a100220ce69d029bfe6f709875485a9e1b81190f19996eca1e633a825bc01",
  name: "updateInboxEscalationFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => updateInboxEscalationFn.__executeServer(opts));
const updateInboxEscalationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateInboxEscalationPayloadSchema).handler(updateInboxEscalationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await Promise.all(data.updates.map(async (update) => {
      const inboxData = await context.authInfo.inbox.getInbox(update.inboxId);
      return context.authInfo.inbox.updateInbox(update.inboxId, {
        name: inboxData.name,
        escalationInboxId: update.escalationInboxId
      });
    }));
  } catch {
    throw new Error("Failed to update inbox escalation");
  }
});
const updateAutoAssignFn_createServerFn_handler = createServerRpc({
  id: "d1a13ae8f732eefdeea5228ea79db17342d620a69832401c049ee1c8308fff01",
  name: "updateAutoAssignFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => updateAutoAssignFn.__executeServer(opts));
const updateAutoAssignFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateAutoAssignPayloadSchema).handler(updateAutoAssignFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const inboxEntries = Object.entries(data.inboxes);
    await Promise.all(inboxEntries.map(async ([inboxId, autoAssignEnabled]) => {
      const inboxData = await context.authInfo.inbox.getInbox(inboxId);
      return context.authInfo.inbox.updateInbox(inboxId, {
        name: inboxData.name,
        escalationInboxId: inboxData.escalationInboxId,
        autoAssignEnabled
      });
    }));
    const userEntries = Object.entries(data.users);
    await Promise.all(userEntries.map(([userId, autoAssignable]) => context.authInfo.inbox.updateInboxUser(userId, {
      autoAssignable
    })));
  } catch {
    throw new Error("Failed to update auto-assign");
  }
});
const updateInboxWorkflowFn_createServerFn_handler = createServerRpc({
  id: "e2260ee1da905a472c233d98f5e030021e4975dde185a2a2af9c7aa4e84372cd",
  name: "updateInboxWorkflowFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => updateInboxWorkflowFn.__executeServer(opts));
const updateInboxWorkflowFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateInboxWorkflowPayloadSchema).handler(updateInboxWorkflowFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await Promise.all(data.updates.map(async (update) => {
      const inboxData = await context.authInfo.inbox.getInbox(update.inboxId);
      return context.authInfo.inbox.updateInbox(update.inboxId, {
        name: inboxData.name,
        caseReviewManual: update.caseReviewManual,
        caseReviewOnCaseCreated: update.caseReviewOnCaseCreated,
        caseReviewOnEscalate: update.caseReviewOnEscalate
      });
    }));
  } catch {
    throw new Error("Failed to update inbox workflow");
  }
});
const getNextUnassignedCaseFn_createServerFn_handler = createServerRpc({
  id: "87fdcf7fcb5a7dfe1c2726c1e66ec7c76ecdff164f291ddb19f554e2d88b0a92",
  name: "getNextUnassignedCaseFn",
  filename: "src/server-fns/cases.ts"
}, (opts) => getNextUnassignedCaseFn.__executeServer(opts));
const getNextUnassignedCaseFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string()
})).handler(getNextUnassignedCaseFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const nextCaseId = await context.authInfo.cases.getNextUnassignedCaseId({
      caseId: data.caseId
    });
    if (!nextCaseId) {
      throw redirect({
        to: "/cases/inboxes/$inboxId",
        params: {
          inboxId: MY_INBOX_ID
        }
      });
    }
    throw redirect({
      to: "/cases/$caseId",
      params: {
        caseId: fromUUIDtoSUUID(nextCaseId)
      }
    });
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
    throw redirect({
      href: `/cases/inboxes/${MY_INBOX_ID}`
    });
  }
});
export {
  addCaseReviewFeedbackFn_createServerFn_handler,
  addCommentFn_createServerFn_handler,
  addReviewToCaseCommentsFn_createServerFn_handler,
  addRuleSnoozeFn_createServerFn_handler,
  addToCaseFn_createServerFn_handler,
  closeCaseFn_createServerFn_handler,
  createCaseFn_createServerFn_handler,
  editAssigneeFn_createServerFn_handler,
  editInboxFn_createServerFn_handler,
  editNameFn_createServerFn_handler,
  editSuspicionFn_createServerFn_handler,
  editTagsFn_createServerFn_handler,
  enqueueReviewFn_createServerFn_handler,
  enrichKycFn_createServerFn_handler,
  escalateCaseFn_createServerFn_handler,
  getAiSettingsFn_createServerFn_handler,
  getCaseDetailFn_createServerFn_handler,
  getCaseNameFn_createServerFn_handler,
  getCaseReviewFn_createServerFn_handler,
  getCasesFn_createServerFn_handler,
  getInboxesFn_createServerFn_handler,
  getNextUnassignedCaseFn_createServerFn_handler,
  getPivotRelatedCasesFn_createServerFn_handler,
  getRelatedCasesByObjectFn_createServerFn_handler,
  getRulesByPivotFn_createServerFn_handler,
  listCaseDecisionsFn_createServerFn_handler,
  listCaseReviewsFn_createServerFn_handler,
  listSuspicionActivityReportsFn_createServerFn_handler,
  massUpdateCasesFn_createServerFn_handler,
  openCaseFn_createServerFn_handler,
  reviewDecisionFn_createServerFn_handler,
  reviewScreeningMatchFn_createServerFn_handler,
  setAllMatchesToNoHitFn_createServerFn_handler,
  snoozeCaseFn_createServerFn_handler,
  updateAiSettingsFn_createServerFn_handler,
  updateAutoAssignFn_createServerFn_handler,
  updateInboxEscalationFn_createServerFn_handler,
  updateInboxWorkflowFn_createServerFn_handler
};
