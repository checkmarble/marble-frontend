import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { analyticsQuery, dateRangeFilterSchema } from '@app-builder/models/analytics';
import {
  adaptAvailableFiltersResponse,
  transformAvailableFiltersRequest,
} from '@app-builder/models/analytics/available-filters';
import {
  adaptCaseSlaStatusByDate,
  adaptCasesCreated,
  adaptCasesDuration,
  adaptFalsePositiveRate,
  adaptOpenCasesByAge,
  adaptSarDelay,
  adaptSarDelayDistribution,
} from '@app-builder/models/analytics/case-analytics';
import { adaptCaseStatusByInbox } from '@app-builder/models/analytics/case-status-by-inbox';
import { adaptCaseStatusByDate } from '@app-builder/models/analytics/cases-status-by-date';
import type { ExportedFields } from '@app-builder/models/data-model';
import {
  getDecisionOutcomesPerDay,
  getDecisionsScoreDistribution,
  getRuleHitTable,
  getRuleVsDecisionOutcome,
  getScreeningHitsTable,
} from '@app-builder/server/analytics';
import { getDataModel, getDataModelTableExportedFields } from '@app-builder/server/data-model';
import {
  buildExistingFilterRows,
  type CustomFilterTableConfig,
  type ExistingCustomFilterRow,
  getFilterableTableConfig,
} from '@app-builder/utils/analytics/custom-filters';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

const caseAnalyticsQuerySchema = z.object({
  start: z.string(),
  end: z.string(),
  timezone: z.string(),
});

export const getCaseStatusByDateFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(caseAnalyticsQuerySchema)
  .handler(async ({ context, data }) => {
    const casesStatusByDate = (await context.api.getCaseStatusByDate(data)).map(adaptCaseStatusByDate);
    return { casesStatusByDate };
  });

export const getCaseStatusByInboxFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(caseAnalyticsQuerySchema)
  .handler(async ({ context, data }) => {
    const caseStatusByInbox = (await context.api.getCaseStatusByInbox(data)).map(adaptCaseStatusByInbox);
    return { caseStatusByInbox };
  });

const availableFiltersInputSchema = z.object({
  scenarioId: z.uuid(),
  ranges: protectArray(z.array(dateRangeFilterSchema).min(1)),
});

const customFiltersConfigInputSchema = z.object({
  triggerObjectTypes: protectArray(z.array(z.string())),
});

export type CustomFiltersConfig = {
  tableConfigs: CustomFilterTableConfig[];
  existingFilters: ExistingCustomFilterRow[];
};

export const getCustomFiltersConfigFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(customFiltersConfigInputSchema)
  .handler(async ({ context, data }): Promise<CustomFiltersConfig> => {
    const { api } = context;
    const triggerObjectTypeSet = new Set(data.triggerObjectTypes);

    const dataModel = await getDataModel(api);
    const triggerTables = dataModel.filter((table) => triggerObjectTypeSet.has(table.name));

    const exportedEntries = await Promise.all(
      triggerTables.map(async (table) => {
        const exported = await getDataModelTableExportedFields(api, table.id);
        return [table.id, exported] as const;
      }),
    );

    const exportedByTableId = Object.fromEntries(exportedEntries) as Record<string, ExportedFields>;

    return {
      tableConfigs: triggerTables.map((table) => getFilterableTableConfig(table, dataModel)),
      existingFilters: buildExistingFilterRows(data.triggerObjectTypes, triggerTables, exportedByTableId),
    };
  });

export const getAvailableFiltersFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(availableFiltersInputSchema)
  .handler(async ({ context, data }) => {
    return context.api
      .getAvailableFilters(transformAvailableFiltersRequest({ scenarioId: data.scenarioId, ranges: data.ranges }))
      .then((response) => adaptAvailableFiltersResponse(response));
  });

export const getDecisionOutcomesPerDayFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(analyticsQuery)
  .handler(async ({ context, data }) => {
    return getDecisionOutcomesPerDay(context.api, data);
  });

export const getDecisionsScoreDistributionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(analyticsQuery)
  .handler(async ({ context, data }) => {
    return getDecisionsScoreDistribution(context.api, data);
  });

export const getRuleHitTableFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(analyticsQuery)
  .handler(async ({ context, data }) => {
    return getRuleHitTable(context.api, data);
  });

export const getRuleVsDecisionOutcomeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(analyticsQuery)
  .handler(async ({ context, data }) => {
    return getRuleVsDecisionOutcome(context.api, data);
  });

export const getScreeningHitsTableFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(analyticsQuery)
  .handler(async ({ context, data }) => {
    return getScreeningHitsTable(context.api, data);
  });

const caseAnalyticsInputSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  timezone: z.string(),
  inboxId: z.string().optional(),
  userId: z.string().optional(),
});

export const getCaseAnalyticsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(caseAnalyticsInputSchema)
  .handler(async ({ context, data }) => {
    const endDateMidnight = new Date(data.endDate);
    endDateMidnight.setUTCDate(endDateMidnight.getUTCDate() + 1);

    const query = {
      start: new Date(data.startDate).toISOString(),
      end: endDateMidnight.toISOString(),
      timezone: data.timezone,
      ...(data.inboxId ? { inbox_id: data.inboxId } : {}),
      ...(data.userId ? { assigned_user_id: data.userId } : {}),
    };

    const { api } = context;

    const [
      sarTotalCompleted,
      sarDelayByPeriod,
      sarDelayDistribution,
      alertCountByPeriod,
      falsePositiveRateByPeriod,
      caseDurationByPeriod,
      openCasesByAge,
      caseSlaStatusByDate,
    ] = await Promise.all([
      api.getCasesAnalyticsSarCompleted(query).then((result) => result?.count ?? 0),
      api.getCasesAnalyticsSarDelay(query).then((result) => (result ?? []).map(adaptSarDelay)),
      api.getCasesAnalyticsSarDelayDistribution(query).then((result) => (result ?? []).map(adaptSarDelayDistribution)),
      api.getCasesAnalyticsCasesCreated(query).then((result) => (result ?? []).map(adaptCasesCreated)),
      api.getCasesAnalyticsFalsePositiveRate(query).then((result) => (result ?? []).map(adaptFalsePositiveRate)),
      api.getCasesAnalyticsCasesDuration(query).then((result) => (result ?? []).map(adaptCasesDuration)),
      api.getCasesAnalyticsOpenCasesByAge(query).then((result) => (result ?? []).map(adaptOpenCasesByAge)),
      api.getCaseSlaStatusByDate(query).then((result) => (result ?? []).map(adaptCaseSlaStatusByDate)),
    ]);

    return {
      caseAnalytics: {
        sarTotalCompleted,
        sarDelayByPeriod,
        sarDelayDistribution,
        alertCountByPeriod,
        falsePositiveRateByPeriod,
        caseDurationByPeriod,
        openCasesByAge,
        caseSlaStatusByDate,
      },
    };
  });
