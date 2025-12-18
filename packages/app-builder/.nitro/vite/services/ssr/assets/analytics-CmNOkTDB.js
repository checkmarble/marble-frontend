import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { J as protectArray, K as dateRangeFilterSchema, L as analyticsQuery } from "./services-middleware-DR8Hua1Y.js";
import { b as buildExistingFilterRows, g as getFilterableTableConfig } from "./custom-filters-DeyaL8MH.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string, k as array, j as uuid } from "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const caseAnalyticsQuerySchema = object({
  start: string(),
  end: string(),
  timezone: string()
});
const getCaseStatusByDateFn_createServerFn_handler = createServerRpc({
  id: "7bf3fa45f12dec9f5261b4c7fbc73143b17ef43501090d86132f22c529807c93",
  name: "getCaseStatusByDateFn",
  filename: "src/server-fns/analytics.ts"
}, (opts) => getCaseStatusByDateFn.__executeServer(opts));
const getCaseStatusByDateFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(caseAnalyticsQuerySchema).handler(getCaseStatusByDateFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const casesStatusByDate = await context.authInfo.analytics.getCaseStatusByDate(data);
  return {
    casesStatusByDate
  };
});
const getCaseStatusByInboxFn_createServerFn_handler = createServerRpc({
  id: "1cf2c2799fcef435af387b7771083e3938a3308e27b59e7b8d3d6ade3c637393",
  name: "getCaseStatusByInboxFn",
  filename: "src/server-fns/analytics.ts"
}, (opts) => getCaseStatusByInboxFn.__executeServer(opts));
const getCaseStatusByInboxFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(caseAnalyticsQuerySchema).handler(getCaseStatusByInboxFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const caseStatusByInbox = await context.authInfo.analytics.getCaseStatusByInbox(data);
  return {
    caseStatusByInbox
  };
});
const availableFiltersInputSchema = object({
  scenarioId: uuid(),
  ranges: protectArray(array(dateRangeFilterSchema).min(1))
});
const customFiltersConfigInputSchema = object({
  triggerObjectTypes: protectArray(array(string()))
});
const getCustomFiltersConfigFn_createServerFn_handler = createServerRpc({
  id: "460c9e6b1a545f5d9b7814f245ff9a3c002a2d23a75049c9a0b67bef1c31ede8",
  name: "getCustomFiltersConfigFn",
  filename: "src/server-fns/analytics.ts"
}, (opts) => getCustomFiltersConfigFn.__executeServer(opts));
const getCustomFiltersConfigFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(customFiltersConfigInputSchema).handler(getCustomFiltersConfigFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    dataModelRepository
  } = context.authInfo;
  const triggerObjectTypeSet = new Set(data.triggerObjectTypes);
  const dataModel = await dataModelRepository.getDataModel();
  const triggerTables = dataModel.filter((table) => triggerObjectTypeSet.has(table.name));
  const exportedEntries = await Promise.all(triggerTables.map(async (table) => {
    const exported = await dataModelRepository.getDataModelTableExportedFields(table.id);
    return [table.id, exported];
  }));
  const exportedByTableId = Object.fromEntries(exportedEntries);
  return {
    tableConfigs: triggerTables.map((table) => getFilterableTableConfig(table, dataModel)),
    existingFilters: buildExistingFilterRows(data.triggerObjectTypes, triggerTables, exportedByTableId)
  };
});
const getAvailableFiltersFn_createServerFn_handler = createServerRpc({
  id: "c4d7caa7ca210f7aecb8c771c038067f3b63800b136f7984b4e49342381762c0",
  name: "getAvailableFiltersFn",
  filename: "src/server-fns/analytics.ts"
}, (opts) => getAvailableFiltersFn.__executeServer(opts));
const getAvailableFiltersFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(availableFiltersInputSchema).handler(getAvailableFiltersFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.analytics.getAvailableFilters({
    scenarioId: data.scenarioId,
    ranges: data.ranges
  });
});
const getDecisionOutcomesPerDayFn_createServerFn_handler = createServerRpc({
  id: "037a9791565e873681cbb99b49b11c7d5c5e8e55f9c0bb1949a848090228caed",
  name: "getDecisionOutcomesPerDayFn",
  filename: "src/server-fns/analytics.ts"
}, (opts) => getDecisionOutcomesPerDayFn.__executeServer(opts));
const getDecisionOutcomesPerDayFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(analyticsQuery).handler(getDecisionOutcomesPerDayFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.analytics.getDecisionOutcomesPerDay(data);
});
const getDecisionsScoreDistributionFn_createServerFn_handler = createServerRpc({
  id: "730a630dc6d7eb67a3fbace85bbf001bed5e847a01d4298e0e6c12beb525b42d",
  name: "getDecisionsScoreDistributionFn",
  filename: "src/server-fns/analytics.ts"
}, (opts) => getDecisionsScoreDistributionFn.__executeServer(opts));
const getDecisionsScoreDistributionFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(analyticsQuery).handler(getDecisionsScoreDistributionFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.analytics.getDecisionsScoreDistribution(data);
});
const getRuleHitTableFn_createServerFn_handler = createServerRpc({
  id: "562fb34c2b62884dfcccdfbffd301f0330be037546fdfdcc3c0c9cf0ebe31ff3",
  name: "getRuleHitTableFn",
  filename: "src/server-fns/analytics.ts"
}, (opts) => getRuleHitTableFn.__executeServer(opts));
const getRuleHitTableFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(analyticsQuery).handler(getRuleHitTableFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.analytics.getRuleHitTable(data);
});
const getRuleVsDecisionOutcomeFn_createServerFn_handler = createServerRpc({
  id: "f7b0a4515ec9a4aefb597cce3d3df2ffab191c3d5697df0a4ba0d155d12e2055",
  name: "getRuleVsDecisionOutcomeFn",
  filename: "src/server-fns/analytics.ts"
}, (opts) => getRuleVsDecisionOutcomeFn.__executeServer(opts));
const getRuleVsDecisionOutcomeFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(analyticsQuery).handler(getRuleVsDecisionOutcomeFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.analytics.getRuleVsDecisionOutcome(data);
});
const getScreeningHitsTableFn_createServerFn_handler = createServerRpc({
  id: "d258b3f9cee7bf652d5dcd6449e7207352b662ac5519d7f01102bacf5e6a309e",
  name: "getScreeningHitsTableFn",
  filename: "src/server-fns/analytics.ts"
}, (opts) => getScreeningHitsTableFn.__executeServer(opts));
const getScreeningHitsTableFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(analyticsQuery).handler(getScreeningHitsTableFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.analytics.getScreeningHitsTable(data);
});
const caseAnalyticsInputSchema = object({
  startDate: string(),
  endDate: string(),
  timezone: string(),
  inboxId: string().optional(),
  userId: string().optional()
});
const getCaseAnalyticsFn_createServerFn_handler = createServerRpc({
  id: "41738591d4735d5497defefaf495d3540da1be13b94167cba19e58dace773927",
  name: "getCaseAnalyticsFn",
  filename: "src/server-fns/analytics.ts"
}, (opts) => getCaseAnalyticsFn.__executeServer(opts));
const getCaseAnalyticsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(caseAnalyticsInputSchema).handler(getCaseAnalyticsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const endDateMidnight = new Date(data.endDate);
  endDateMidnight.setUTCDate(endDateMidnight.getUTCDate() + 1);
  const query = {
    start: new Date(data.startDate).toISOString(),
    end: endDateMidnight.toISOString(),
    timezone: data.timezone,
    ...data.inboxId ? {
      inbox_id: data.inboxId
    } : {},
    ...data.userId ? {
      assigned_user_id: data.userId
    } : {}
  };
  const {
    analytics
  } = context.authInfo;
  const [sarTotalCompleted, sarDelayByPeriod, sarDelayDistribution, alertCountByPeriod, falsePositiveRateByPeriod, caseDurationByPeriod, openCasesByAge] = await Promise.all([analytics.getCasesSarCompleted(query), analytics.getCasesSarDelay(query), analytics.getCasesSarDelayDistribution(query), analytics.getCasesCreated(query), analytics.getCasesFalsePositiveRate(query), analytics.getCasesDuration(query), analytics.getOpenCasesByAge(query)]);
  return {
    caseAnalytics: {
      sarTotalCompleted,
      sarDelayByPeriod,
      sarDelayDistribution,
      alertCountByPeriod,
      falsePositiveRateByPeriod,
      caseDurationByPeriod,
      openCasesByAge
    }
  };
});
export {
  getAvailableFiltersFn_createServerFn_handler,
  getCaseAnalyticsFn_createServerFn_handler,
  getCaseStatusByDateFn_createServerFn_handler,
  getCaseStatusByInboxFn_createServerFn_handler,
  getCustomFiltersConfigFn_createServerFn_handler,
  getDecisionOutcomesPerDayFn_createServerFn_handler,
  getDecisionsScoreDistributionFn_createServerFn_handler,
  getRuleHitTableFn_createServerFn_handler,
  getRuleVsDecisionOutcomeFn_createServerFn_handler,
  getScreeningHitsTableFn_createServerFn_handler
};
