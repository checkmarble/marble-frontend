import { ScoringRulesetPage } from '@app-builder/components/UserScoring/ScoringRulesetPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isNotFoundHttpError } from '@app-builder/models';
import { type ScenarioPublicationStatus } from '@app-builder/models/scenario/publication';
import { type ScoringRulesetWithRules } from '@app-builder/models/scoring';
import { listCustomLists } from '@app-builder/server/custom-lists';
import { getRulesetPreparationStatus, getRulesetWithRules, getScoringDryRun } from '@app-builder/server/user-scoring';
import { hasAnyEntitlement } from '@app-builder/services/feature-access';
import { normalizeTimestampForInstant } from '@app-builder/utils/datetime';
import { tryCatch } from '@app-builder/utils/tryCatch';
import { createFileRoute, redirect, useLoaderData } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { Temporal } from 'temporal-polyfill';

const DRY_RUN_STALE_LIMIT_IN_DAYS = 7;

function isValidDryRun(createdAt: string | undefined): boolean {
  if (!createdAt) return false;

  const isValid = tryCatch(() => {
    const createdAtInstant = Temporal.Instant.from(normalizeTimestampForInstant(createdAt));
    const now = Temporal.Now.zonedDateTimeISO();
    const windowStart = now.subtract({ days: DRY_RUN_STALE_LIMIT_IN_DAYS }).toInstant();
    const windowEnd = now.toInstant();

    return (
      Temporal.Instant.compare(createdAtInstant, windowStart) >= 0 &&
      Temporal.Instant.compare(createdAtInstant, windowEnd) <= 0
    );
  });
  return isValid.ok && isValid.value;
}

const scoringRulesetLoader = createServerFn()
  .middleware([authMiddleware])
  .validator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function scoringRulesetLoader({ data, context }) {
    const { api, entitlements } = context;

    const recordType = data?.params?.['recordType'] ?? '';
    const version = data?.params?.['version'] ?? '';

    let ruleset: ScoringRulesetWithRules | null = null;
    try {
      ruleset = await getRulesetWithRules(api, recordType, version);
    } catch (err) {
      if (isNotFoundHttpError(err)) {
        throw redirect({ to: '/user-scoring/overview' });
      }
      throw err;
    }

    const customLists = await listCustomLists(api);
    const dryRunResult = await getScoringDryRun(api, recordType);

    let preparationStatus: ScenarioPublicationStatus | null = null;
    if (ruleset.status === 'draft') {
      preparationStatus = await getRulesetPreparationStatus(api, recordType);
    }

    return {
      ruleset,
      customLists,
      preparationStatus,
      lastDryRun: dryRunResult.error || !isValidDryRun(dryRunResult.dryRun?.createdAt) ? null : dryRunResult.dryRun,
      canLaunchDryRun: dryRunResult.error == null,
      hasValidLicense: hasAnyEntitlement(entitlements),
    };
  });

export const Route = createFileRoute('/_app/_builder/user-scoring/$recordType/$version')({
  loader: ({ params }) => scoringRulesetLoader({ data: { params } }),
  component: UserScoringRulesetRoute,
});

function UserScoringRulesetRoute() {
  const loaderData = Route.useLoaderData();
  const parentData = useLoaderData({ from: '/_app/_builder/user-scoring' });

  // During router.invalidate(), loader data can be temporarily undefined
  if (!loaderData || !parentData?.settings) return null;

  const { ruleset, customLists, preparationStatus, hasValidLicense, lastDryRun, canLaunchDryRun } = loaderData;
  const { settings, canUpdateScoringRulesets } = parentData;

  return (
    <ScoringRulesetPage
      key={ruleset.recordType}
      ruleset={ruleset}
      settings={settings}
      customLists={customLists}
      preparationStatus={preparationStatus}
      hasValidLicense={hasValidLicense}
      lastDryRun={lastDryRun}
      canLaunchDryRun={canLaunchDryRun}
      canUpdateScoringRulesets={canUpdateScoringRulesets}
    />
  );
}
