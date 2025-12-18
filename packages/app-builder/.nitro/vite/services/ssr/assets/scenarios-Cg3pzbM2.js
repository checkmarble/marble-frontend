import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { b as captureException, V as ValidationError, P as PreparationIsRequiredError, Q as PreparationServiceOccupied, R as IsDraftError, S as isStatusBadRequestHttpError, I as isStatusConflictHttpError, j as NewPayloadAstNode, l as isKnownOperandAstNode, o as t, p as t$1, q as isLeafOperandAstNode, k as NewDatabaseAccessAstNode, u as t$2, v as n } from "./services-middleware-DR8Hua1Y.js";
import { d as archiveScenarioPayloadSchema, b as copyScenarioPayloadSchema, c as createScenarioPayloadSchema, u as unarchiveScenarioPayloadSchema, a as updateScenarioPayloadSchema, k as generateRuleInputSchema, g as activateIterationPayloadSchema, f as commitIterationPayloadSchema, h as deactivateIterationPayloadSchema, p as prepareIterationPayloadSchema, j as deleteRulePayloadSchema, i as duplicateRulePayloadSchema, e as createTestRunPayloadSchema } from "./scenarios-8U74nJp4.js";
import { a as isContinuousScreeningAvailable, h as hasAnyEntitlement } from "./feature-access-B8PIS8ad.js";
import { b as fromUUIDtoSUUID, o as object, e as unknown, s as string, d as any } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, x as redirect, a4 as getRequest } from "../server.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
function adaptUnifiedEvaluationError(error) {
  return {
    error: error.error,
    message: error.message,
    path: error.path ?? error.argumentIndex?.toString() ?? error.argumentName
  };
}
function getErrorsForChild(errors, indexOrKey) {
  return t$2(errors, n((err) => {
    if (err.path === void 0) return false;
    return err.path === indexOrKey || err.path.startsWith(`${indexOrKey}.`);
  }), t((err) => {
    let fieldPath = err.path;
    if (fieldPath != void 0) {
      if (fieldPath === indexOrKey) {
        fieldPath = void 0;
      } else if (fieldPath?.toString().startsWith(`${indexOrKey}.`)) {
        fieldPath = fieldPath.replace(new RegExp(`^${indexOrKey}\\.`), "");
      }
    }
    return {
      ...err,
      path: fieldPath
    };
  }));
}
function generateFlatEvaluation(node, evaluation, relatedIds = []) {
  const isOperandNode = isKnownOperandAstNode(node);
  const errors = t(evaluation.errors, adaptUnifiedEvaluationError);
  const currentRelatedId = isOperandNode ? [node.id] : [...relatedIds, node.id];
  const childrenEvaluations = node.children.flatMap((childNode, i) => {
    const childEvaluation = evaluation.children[i];
    if (!childEvaluation) return [];
    const childErrorsFromParent = getErrorsForChild(errors, i.toString());
    const childEvaluationWithParentError = {
      ...childEvaluation,
      errors: [...childEvaluation.errors, ...childErrorsFromParent]
    };
    return generateFlatEvaluation(childNode, childEvaluationWithParentError, currentRelatedId);
  });
  const namedChildrenEvaluations = t$1(node.namedChildren).flatMap(([key, childNode]) => {
    const childEvaluation = evaluation.namedChildren[key];
    if (!childEvaluation) return [];
    const childErrorsFromParent = getErrorsForChild(errors, key);
    const childEvaluationWithParentError = {
      ...childEvaluation,
      errors: [...childEvaluation.errors, ...childErrorsFromParent]
    };
    return generateFlatEvaluation(childNode, childEvaluationWithParentError, currentRelatedId);
  });
  const hasChildError = childrenEvaluations.filter((e) => e.errors.length > 0).length > 0 || namedChildrenEvaluations.filter((e) => e.errors.length > 0).length > 0;
  const currentErrors = [...errors.filter((err) => !err.path), ...hasChildError && isLeafOperandAstNode(node) ? [{
    error: "FUNCTION_ERROR",
    message: "function has error"
  }] : []];
  const currentNodeEvaluation = {
    returnValue: evaluation.returnValue,
    errors: currentErrors,
    skipped: evaluation.skipped,
    nodeId: node.id,
    relatedIds: [...relatedIds, node.id]
  };
  return [currentNodeEvaluation, ...childrenEvaluations, ...namedChildrenEvaluations];
}
function buildPayloadAccessorsFromDataModel(dataModel, triggerObjectType) {
  const table = dataModel.find((t2) => t2.name === triggerObjectType);
  if (!table) return [];
  return table.fields.map((f) => NewPayloadAstNode(f.name));
}
function buildDatabaseAccessorsFromDataModel(dataModel, triggerObjectType) {
  const triggerTable = dataModel.find((t2) => t2.name === triggerObjectType);
  if (!triggerTable) return [];
  const accessors = [];
  function recurse(path, linksToSingle, visited) {
    for (const link of linksToSingle) {
      const linkedTable = dataModel.find((t2) => t2.name === link.parentTableName);
      if (!linkedTable || visited.includes(linkedTable.name)) continue;
      const pathForLink = [...path, link.name];
      for (const field of linkedTable.fields) {
        if (field.hidden) continue;
        accessors.push(NewDatabaseAccessAstNode({
          tableName: triggerObjectType,
          fieldName: field.name,
          path: pathForLink
        }));
      }
      recurse(pathForLink, linkedTable.linksToSingle, [...visited, linkedTable.name]);
    }
  }
  recurse([], triggerTable.linksToSingle, [triggerTable.name]);
  return accessors;
}
const archiveScenarioFn_createServerFn_handler = createServerRpc({
  id: "2d7100b40687945ab2456f35825bd6c33aaf217a51654dc55ee46af8bd1d928b",
  name: "archiveScenarioFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => archiveScenarioFn.__executeServer(opts));
const archiveScenarioFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(archiveScenarioPayloadSchema).handler(archiveScenarioFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.scenario.archiveScenario({
      scenarioId: data.scenarioId
    });
    throw redirect({
      to: "/detection/scenarios"
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to archive scenario");
  }
});
const copyScenarioFn_createServerFn_handler = createServerRpc({
  id: "9c16c172bca160e3f7fc361739140c28a4097f84a9be3fdb80c65789479f4796",
  name: "copyScenarioFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => copyScenarioFn.__executeServer(opts));
const copyScenarioFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(copyScenarioPayloadSchema).handler(copyScenarioFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.scenario.copyScenario({
    scenarioId: data.scenarioId,
    name: data.name || void 0
  });
});
const createScenarioFn_createServerFn_handler = createServerRpc({
  id: "f5641a95755d85fbbf752d30ca29b5a241cd44bb012fada0dbea71e1fe4dc7de",
  name: "createScenarioFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => createScenarioFn.__executeServer(opts));
const createScenarioFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createScenarioPayloadSchema).handler(createScenarioFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const createdScenario = await context.authInfo.scenario.createScenario(data);
    const scenarioIteration = await context.authInfo.scenario.createScenarioIteration({
      scenarioId: createdScenario.id
    });
    throw redirect({
      href: `/detection/scenarios/${fromUUIDtoSUUID(createdScenario.id)}/i/${fromUUIDtoSUUID(scenarioIteration.id)}`
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to create scenario");
  }
});
const unarchiveScenarioFn_createServerFn_handler = createServerRpc({
  id: "07f381cd947e2ce40d42defed41552acd2e4dc177cdb37795e212a29db386ba7",
  name: "unarchiveScenarioFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => unarchiveScenarioFn.__executeServer(opts));
const unarchiveScenarioFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(unarchiveScenarioPayloadSchema).handler(unarchiveScenarioFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.scenario.unarchiveScenario({
      scenarioId: data.scenarioId
    });
  } catch {
    throw new Error("Failed to unarchive scenario");
  }
});
const updateScenarioFn_createServerFn_handler = createServerRpc({
  id: "edda937b3a03ff8cb495aeb66e4a69707d30c5b9c271d98d9fd6dabac503df33",
  name: "updateScenarioFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => updateScenarioFn.__executeServer(opts));
const updateScenarioFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateScenarioPayloadSchema).handler(updateScenarioFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.scenario.updateScenario(data);
  } catch {
    throw new Error("Failed to update scenario");
  }
});
const getRuleDescriptionFn_createServerFn_handler = createServerRpc({
  id: "769522befd24b072c6865643d892e7ef5f97ce5a3401a8595862240f4cb9111f",
  name: "getRuleDescriptionFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => getRuleDescriptionFn.__executeServer(opts));
const getRuleDescriptionFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  astNode: unknown()
})).handler(getRuleDescriptionFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    description,
    isRuleValid
  } = await context.authInfo.scenarioIterationRuleRepository.getRuleDescription({
    scenarioId: data.scenarioId,
    astNode: data.astNode
  });
  return {
    description,
    isRuleValid
  };
});
const getBuilderOptionsFn_createServerFn_handler = createServerRpc({
  id: "97aa765bfb2425b7c56f6b542173eb05eeb7bd8739a091781ebe74dfa31d9861",
  name: "getBuilderOptionsFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => getBuilderOptionsFn.__executeServer(opts));
const getBuilderOptionsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string()
})).handler(getBuilderOptionsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    scenario,
    dataModelRepository,
    customListsRepository,
    continuousScreening,
    entitlements,
    userScoring
  } = context.authInfo;
  const [currentScenario, customLists, dataModel, screeningConfigs, scoringRulesets, scoringSettings] = await Promise.all([scenario.getScenario({
    scenarioId: data.scenarioId
  }), customListsRepository.listCustomLists(), dataModelRepository.getDataModel(), isContinuousScreeningAvailable(entitlements) ? continuousScreening.listConfigurations() : Promise.resolve([]), userScoring.listRulesets(), userScoring.getSettings()]);
  return {
    triggerObjectType: currentScenario.triggerObjectType,
    customLists,
    dataModel,
    databaseAccessors: buildDatabaseAccessorsFromDataModel(dataModel, currentScenario.triggerObjectType),
    payloadAccessors: buildPayloadAccessorsFromDataModel(dataModel, currentScenario.triggerObjectType),
    hasValidLicense: hasAnyEntitlement(entitlements),
    hasContinuousScreening: isContinuousScreeningAvailable(entitlements),
    screeningConfigs,
    hasScoringRuleset: scoringRulesets.length > 0,
    scoringSettings
  };
});
const validateAstFn_createServerFn_handler = createServerRpc({
  id: "a3f82d4acb2686ffe2e5b001f8c0c3edc2466641ccea4fb25f9ad76c4d0fcc41",
  name: "validateAstFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => validateAstFn.__executeServer(opts));
const validateAstFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  node: unknown(),
  expectedReturnType: string().optional()
})).handler(validateAstFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const res = await context.authInfo.scenario.validateAst(data.scenarioId, {
      node: data.node,
      expectedReturnType: data.expectedReturnType
    });
    const flatEval = generateFlatEvaluation(data.node, res.evaluation);
    return {
      original: res,
      flat: {
        errors: res.errors,
        evaluation: flatEval
      }
    };
  } catch (error) {
    captureException(error);
    throw new Error("Validation failed");
  }
});
const generateAstFn_createServerFn_handler = createServerRpc({
  id: "3face8d1e66d149b4aab1655e42cd59c7efb3b66972849e778b5022a4a3f4ad7",
  name: "generateAstFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => generateAstFn.__executeServer(opts));
const generateAstFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(generateRuleInputSchema).handler(generateAstFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const result = await context.authInfo.scenarioIterationRuleRepository.generateRuleAst({
      scenarioId: data.scenarioId,
      ruleId: data.ruleId,
      instruction: data.instruction
    });
    return {
      success: true,
      ...result
    };
  } catch {
    return {
      success: false
    };
  }
});
const saveTriggerPayloadSchema = object({
  iterationId: string(),
  schedule: string(),
  astNode: any()
});
const saveTriggerFn_createServerFn_handler = createServerRpc({
  id: "2d8e3f709e51112f7756b3d1ab577bb35b7e3324c07eaf86864aa59ebbfebfeb",
  name: "saveTriggerFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => saveTriggerFn.__executeServer(opts));
const saveTriggerFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(saveTriggerPayloadSchema).handler(saveTriggerFn_createServerFn_handler, async function saveTriggerAction({
  context,
  data: {
    iterationId,
    schedule,
    astNode
  }
}) {
  const {
    scenario
  } = context.authInfo;
  await scenario.updateScenarioIteration(iterationId, {
    triggerConditionAstExpression: astNode,
    schedule
  });
});
const activateIterationFn_createServerFn_handler = createServerRpc({
  id: "7de8f78e734f6d311b0794592f0fe7afa5c18a13e3c5015554d865d34486a594",
  name: "activateIterationFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => activateIterationFn.__executeServer(opts));
const activateIterationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(activateIterationPayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(activateIterationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.scenario.createScenarioPublication({
      publicationAction: "publish",
      scenarioIterationId: data.iterationId
    });
    throw redirect({
      to: "/detection/scenarios/$scenarioId/i/$iterationId",
      params: {
        scenarioId: fromUUIDtoSUUID(data.scenarioId),
        iterationId: fromUUIDtoSUUID(data.iterationId)
      }
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    if (error instanceof ValidationError) return {
      error: "validation_error"
    };
    if (error instanceof PreparationIsRequiredError) return {
      error: "preparation_is_required"
    };
    if (error instanceof PreparationServiceOccupied) return {
      error: "preparation_service_occupied"
    };
    if (error instanceof IsDraftError) return {
      error: "is_draft"
    };
    return {
      error: "unknown"
    };
  }
});
const commitIterationFn_createServerFn_handler = createServerRpc({
  id: "4db6bfc45b50793333de3ae326dcbab4aec61b81c44aeb67d54a0544c0d06df2",
  name: "commitIterationFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => commitIterationFn.__executeServer(opts));
const commitIterationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(commitIterationPayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(commitIterationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.scenario.commitScenarioIteration({
      iterationId: data.iterationId
    });
    throw redirect({
      to: "/detection/scenarios/$scenarioId/i/$iterationId",
      params: {
        scenarioId: fromUUIDtoSUUID(data.scenarioId),
        iterationId: fromUUIDtoSUUID(data.iterationId)
      }
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    if (isStatusBadRequestHttpError(error)) return {
      error: "validation_error"
    };
    return {
      error: "unknown"
    };
  }
});
const createDraftIterationFn_createServerFn_handler = createServerRpc({
  id: "7d98973cbaea0952d4593fcae71ef17fff2105f0f55b0362b6496a5a00f21399",
  name: "createDraftIterationFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => createDraftIterationFn.__executeServer(opts));
const createDraftIterationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  iterationId: string()
})).handler(createDraftIterationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.apiClient.createDraftFromScenarioIteration(data.iterationId);
});
const deactivateIterationFn_createServerFn_handler = createServerRpc({
  id: "550320d30c99ef1dc46ef4d34361dd96ea62195dd39befd7f0c642c2e7a0537d",
  name: "deactivateIterationFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => deactivateIterationFn.__executeServer(opts));
const deactivateIterationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deactivateIterationPayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(deactivateIterationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.scenario.createScenarioPublication({
      publicationAction: "unpublish",
      scenarioIterationId: data.iterationId
    });
    throw redirect({
      to: "/detection/scenarios/$scenarioId/i/$iterationId",
      params: {
        scenarioId: fromUUIDtoSUUID(data.scenarioId),
        iterationId: fromUUIDtoSUUID(data.iterationId)
      }
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to deactivate iteration");
  }
});
const prepareIterationFn_createServerFn_handler = createServerRpc({
  id: "2ef10e921f72f4e8e31b7e4b2ec61553aa85ceb906bfa1c87c2e3d46dacf4a1f",
  name: "prepareIterationFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => prepareIterationFn.__executeServer(opts));
const prepareIterationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(prepareIterationPayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(prepareIterationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.scenario.startPublicationPreparation({
      iterationId: data.iterationId
    });
    throw redirect({
      to: "/detection/scenarios/$scenarioId/i/$iterationId",
      params: {
        scenarioId: fromUUIDtoSUUID(data.scenarioId),
        iterationId: fromUUIDtoSUUID(data.iterationId)
      }
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    if (error instanceof PreparationServiceOccupied) return {
      error: "preparation_service_occupied"
    };
    return {
      error: "unknown"
    };
  }
});
const getPublicationPreparationStatusFn_createServerFn_handler = createServerRpc({
  id: "3cdce8234c75f1241e5f5a9a3bc4efa972d6329e9c37991994653b6488e308e7",
  name: "getPublicationPreparationStatusFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => getPublicationPreparationStatusFn.__executeServer(opts));
const getPublicationPreparationStatusFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  iterationId: string()
})).handler(getPublicationPreparationStatusFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.scenario.getPublicationPreparationStatus({
    iterationId: data.iterationId
  });
});
const getRuleSnoozeFn_createServerFn_handler = createServerRpc({
  id: "b649b4f8bcb365c4a1d6fba3e15603506e752a6c72da13f32da492c5d9391cf9",
  name: "getRuleSnoozeFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => getRuleSnoozeFn.__executeServer(opts));
const getRuleSnoozeFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  iterationId: string()
})).handler(getRuleSnoozeFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    ruleSnoozes
  } = await context.authInfo.scenario.getScenarioIterationActiveSnoozes(data.iterationId);
  return {
    ruleSnoozes
  };
});
const createRuleFn_createServerFn_handler = createServerRpc({
  id: "7a5cf6ff5d57a37f56f723fe4f0b562bb341aec5227b7fc6ce6ac710588c3bfb",
  name: "createRuleFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => createRuleFn.__executeServer(opts));
const createRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  iterationId: string()
})).handler(createRuleFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.scenarioIterationRuleRepository.createRule({
    scenarioIterationId: data.iterationId,
    displayOrder: 1,
    formula: null,
    name: "",
    description: "",
    ruleGroup: "",
    scoreModifier: 0
  });
});
const deleteRuleFn_createServerFn_handler = createServerRpc({
  id: "bcd60fdf1b642255312a33581a43354f2ff1a39b21a48272ce313b562293ed46",
  name: "deleteRuleFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => deleteRuleFn.__executeServer(opts));
const deleteRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteRulePayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(deleteRuleFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.scenarioIterationRuleRepository.deleteRule({
    ruleId: data.ruleId
  });
  throw redirect({
    to: "/detection/scenarios/$scenarioId/i/$iterationId/rules",
    params: {
      scenarioId: fromUUIDtoSUUID(data.scenarioId),
      iterationId: fromUUIDtoSUUID(data.iterationId)
    }
  });
});
const duplicateRuleFn_createServerFn_handler = createServerRpc({
  id: "556d8a7680f56e413a90f30867650c09c290af8cf9bcb9bff6b92a9f3e7eeb2d",
  name: "duplicateRuleFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => duplicateRuleFn.__executeServer(opts));
const duplicateRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(duplicateRulePayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(duplicateRuleFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const request = getRequest();
  const t2 = await context.services.i18nextService.getFixedT(request, ["scenarios"]);
  const {
    createdAt: _,
    name,
    ...rest
  } = await context.authInfo.scenarioIterationRuleRepository.getRule({
    ruleId: data.ruleId
  });
  return await context.authInfo.scenarioIterationRuleRepository.createRule({
    name: t2("scenarios:clone_rule.default_name", {
      name
    }),
    ...rest
  });
});
const createScreeningRuleFn_createServerFn_handler = createServerRpc({
  id: "4c9de4d330ace79a796e7585a6df95ddb3068812db24b1f202bd377cf0ce6664",
  name: "createScreeningRuleFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => createScreeningRuleFn.__executeServer(opts));
const createScreeningRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  iterationId: string()
})).handler(createScreeningRuleFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const config = await context.authInfo.scenarioIterationScreeningRepository.createScreeningConfig({
    iterationId: data.iterationId,
    changes: {
      name: "",
      ruleGroup: "Screening",
      forcedOutcome: "block_and_review"
    }
  });
  if (!config.id) {
    throw new Error("Screening created without id");
  }
  return {
    ...config,
    id: config.id
  };
});
const deleteScreeningRuleFn_createServerFn_handler = createServerRpc({
  id: "3c7b9ca97df43ba2c4ebde6883b549e1ae7f45aa8843c816b74de7a5fddb4126",
  name: "deleteScreeningRuleFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => deleteScreeningRuleFn.__executeServer(opts));
const deleteScreeningRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  iterationId: string(),
  screeningId: string()
})).handler(deleteScreeningRuleFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.scenarioIterationScreeningRepository.deleteScreeningConfig({
    iterationId: data.iterationId,
    screeningId: data.screeningId
  });
  throw redirect({
    to: "/detection/scenarios/$scenarioId/i/$iterationId/rules",
    params: {
      scenarioId: fromUUIDtoSUUID(data.scenarioId),
      iterationId: fromUUIDtoSUUID(data.iterationId)
    }
  });
});
const cancelTestRunFn_createServerFn_handler = createServerRpc({
  id: "dae75fa64d986db72e5cabd904f22228db84e30d97fed369b04d3ff497ccdc02",
  name: "cancelTestRunFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => cancelTestRunFn.__executeServer(opts));
const cancelTestRunFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  testRunId: string()
})).handler(cancelTestRunFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.testRun.cancelTestRun({
      testRunId: data.testRunId
    });
    throw redirect({
      to: "/detection/scenarios/$scenarioId/test-run",
      params: {
        scenarioId: fromUUIDtoSUUID(data.scenarioId)
      }
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to cancel test run");
  }
});
const createTestRunFn_createServerFn_handler = createServerRpc({
  id: "88c9ce0e9be42b3075dec429a85b9229e9ed0fd7288600c5bacafbcb50e93ae7",
  name: "createTestRunFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => createTestRunFn.__executeServer(opts));
const createTestRunFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createTestRunPayloadSchema.and(object({
  scenarioId: string()
}))).handler(createTestRunFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    scenarioId,
    ...payload
  } = data;
  try {
    await context.authInfo.testRun.launchTestRun({
      ...payload,
      scenarioId
    });
    throw redirect({
      href: `/detection/scenarios/${fromUUIDtoSUUID(scenarioId)}/test-run`
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    if (isStatusConflictHttpError(error)) return {
      error: "duplicate_test_run"
    };
    return {
      error: "unknown"
    };
  }
});
const getIterationRulesFn_createServerFn_handler = createServerRpc({
  id: "0609578262a15348986f5154cf9f83165e3b77426ebd476d8dbb607ad42ca5d5",
  name: "getIterationRulesFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => getIterationRulesFn.__executeServer(opts));
const getIterationRulesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  iterationId: string()
})).handler(getIterationRulesFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const [rules, scenarioIteration] = await Promise.all([context.authInfo.scenarioIterationRuleRepository.listRules({
    scenarioIterationId: data.iterationId
  }), context.authInfo.scenario.getScenarioIterationWithoutRules({
    iterationId: data.iterationId
  })]);
  return {
    rules,
    archived: scenarioIteration.archived
  };
});
const getIterationRuleFn_createServerFn_handler = createServerRpc({
  id: "a81c48bc85c5208715b1ec58392c10a1ba8978e0e1bffe47b2426ae602ca368f",
  name: "getIterationRuleFn",
  filename: "src/server-fns/scenarios.ts"
}, (opts) => getIterationRuleFn.__executeServer(opts));
const getIterationRuleFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  ruleId: string()
})).handler(getIterationRuleFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return {
    rule: await context.authInfo.scenarioIterationRuleRepository.getRule({
      ruleId: data.ruleId
    })
  };
});
export {
  activateIterationFn_createServerFn_handler,
  archiveScenarioFn_createServerFn_handler,
  cancelTestRunFn_createServerFn_handler,
  commitIterationFn_createServerFn_handler,
  copyScenarioFn_createServerFn_handler,
  createDraftIterationFn_createServerFn_handler,
  createRuleFn_createServerFn_handler,
  createScenarioFn_createServerFn_handler,
  createScreeningRuleFn_createServerFn_handler,
  createTestRunFn_createServerFn_handler,
  deactivateIterationFn_createServerFn_handler,
  deleteRuleFn_createServerFn_handler,
  deleteScreeningRuleFn_createServerFn_handler,
  duplicateRuleFn_createServerFn_handler,
  generateAstFn_createServerFn_handler,
  getBuilderOptionsFn_createServerFn_handler,
  getIterationRuleFn_createServerFn_handler,
  getIterationRulesFn_createServerFn_handler,
  getPublicationPreparationStatusFn_createServerFn_handler,
  getRuleDescriptionFn_createServerFn_handler,
  getRuleSnoozeFn_createServerFn_handler,
  prepareIterationFn_createServerFn_handler,
  saveTriggerFn_createServerFn_handler,
  unarchiveScenarioFn_createServerFn_handler,
  updateScenarioFn_createServerFn_handler,
  validateAstFn_createServerFn_handler
};
