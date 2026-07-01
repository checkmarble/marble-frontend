import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { analyticsQuery, dateRangeFilterSchema } from '@app-builder/models/analytics';
import type { ExportedFields } from '@app-builder/models/data-model';
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
    const casesStatusByDate = await context.authInfo.analytics.getCaseStatusByDate(data);
    return { casesStatusByDate };
  });

export const getCaseStatusByInboxFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(caseAnalyticsQuerySchema)
  .handler(async ({ context, data }) => {
    const caseStatusByInbox = await context.authInfo.analytics.getCaseStatusByInbox(data);
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
    const { dataModelRepository } = context.authInfo;
    const triggerObjectTypeSet = new Set(data.triggerObjectTypes);

    const dataModel = await dataModelRepository.getDataModel();
    const triggerTables = dataModel.filter((table) => triggerObjectTypeSet.has(table.name));

    const exportedEntries = await Promise.all(
      triggerTables.map(async (table) => {
        const exported = await dataModelRepository.getDataModelTableExportedFields(table.id);
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
    return context.authInfo.analytics.getAvailableFilters({
      scenarioId: data.scenarioId,
      ranges: data.ranges,
    });
  });

export const getDecisionOutcomesPerDayFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(analyticsQuery)
  .handler(async ({ context, data }) => {
    return context.authInfo.analytics.getDecisionOutcomesPerDay(data);
  });

export const getDecisionsScoreDistributionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(analyticsQuery)
  .handler(async ({ context, data }) => {
    return context.authInfo.analytics.getDecisionsScoreDistribution(data);
  });

export const getRuleHitTableFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(analyticsQuery)
  .handler(async ({ context, data }) => {
    return context.authInfo.analytics.getRuleHitTable(data);
  });

export const getRuleVsDecisionOutcomeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(analyticsQuery)
  .handler(async ({ context, data }) => {
    return context.authInfo.analytics.getRuleVsDecisionOutcome(data);
  });

export const getScreeningHitsTableFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(analyticsQuery)
  .handler(async ({ context, data }) => {
    return context.authInfo.analytics.getScreeningHitsTable(data);
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

    const { analytics } = context.authInfo;

    const [
      sarTotalCompleted,
      sarDelayByPeriod,
      sarDelayDistribution,
      alertCountByPeriod,
      falsePositiveRateByPeriod,
      caseDurationByPeriod,
      openCasesByAge,
    ] = await Promise.all([
      analytics.getCasesSarCompleted(query),
      analytics.getCasesSarDelay(query),
      analytics.getCasesSarDelayDistribution(query),
      analytics.getCasesCreated(query),
      analytics.getCasesFalsePositiveRate(query),
      analytics.getCasesDuration(query),
      analytics.getOpenCasesByAge(query),
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
      },
    };
  });
