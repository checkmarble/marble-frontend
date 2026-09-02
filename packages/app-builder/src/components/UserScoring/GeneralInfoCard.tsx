import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { type ScenarioPublicationStatus } from '@app-builder/models/scenario/publication';
import {
  isMaxRiskLevelInRange,
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABEL_KEYS,
  ScoringDryRun,
  type ScoringRulesetWithRules,
  type ScoringSettings,
  SECONDS_PER_UNIT,
  scoringLevelEntries,
  secondsToDisplay,
} from '@app-builder/models/scoring';
import { useCommitScoringRulesetMutation } from '@app-builder/queries/scoring/commit-ruleset';
import { useGetScoringDryRunQuery } from '@app-builder/queries/scoring/get-dry-run';
import { useListScoringRulesetVersionsQuery } from '@app-builder/queries/scoring/list-ruleset-versions';
import { usePrepareScoringRulesetMutation } from '@app-builder/queries/scoring/prepare-ruleset';
import { useStartScoringDryRunMutation } from '@app-builder/queries/scoring/start-dry-run';
import { useUpdateScoringRulesetMutation } from '@app-builder/queries/scoring/update-ruleset';
import { type UpdateScoringRulesetPayload, updateScoringRulesetPayloadSchema } from '@app-builder/schemas/user-scoring';
import { handleSubmit } from '@app-builder/utils/form';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useForm } from '@tanstack/react-form';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  cn,
  Modal,
  NumberInput,
  Panel,
  PanelSharpFactory,
  type SelectOption,
  SelectV2,
  Tooltip,
} from 'ui-design-system';
import { Icon } from 'ui-icons';
import { pageLayoutGutter } from '../Page/page-layout';
import { ScoringBatchTest } from './ScoringBatchTest';
import { ScoringLevelThresholds } from './ScoringLevelThresholds';

interface GeneralInfoCardProps {
  ruleset: ScoringRulesetWithRules;
  settings: ScoringSettings;
  preparationStatus: ScenarioPublicationStatus | null;
  lastDryRun: ScoringDryRun | null;
}

function formatDuration(seconds: number, t: (key: string) => string): string | null {
  const { value, unit } = secondsToDisplay(seconds);
  if (!unit) return null;
  return `${value} ${t(`common:duration_unit.${unit}`)}`;
}

export function GeneralInfoCard({ ruleset, settings, preparationStatus, lastDryRun }: GeneralInfoCardProps) {
  const { t } = useTranslation(['user-scoring', 'common']);
  const [viewBatchTest, setViewBatchTest] = useState(false);
  const navigate = useAgnosticNavigation();
  const formatDateTime = useFormatDateTime();
  const prepareMutation = usePrepareScoringRulesetMutation();
  const commitMutation = useCommitScoringRulesetMutation();
  const cooldownLabel = formatDuration(ruleset.cooldownSeconds, t);
  const scoringIntervalLabel = formatDuration(ruleset.scoringIntervalSeconds, t);
  const versionsQuery = useListScoringRulesetVersionsQuery(ruleset.recordType);
  const versionOptions: SelectOption<string>[] = (versionsQuery.data?.versions ?? []).map((v) => ({
    value: v.status === 'committed' ? v.version.toString() : 'draft',
    label: v.status === 'committed' ? `V${v.version}` : 'draft',
  }));
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const startDryRun = useStartScoringDryRunMutation();
  const { data: newDryRun } = useGetScoringDryRunQuery(ruleset.recordType, {
    enabled: viewBatchTest || lastDryRun != null,
  });

  const handleVersionChange = (version: string) => {
    navigate(`/user-scoring/${ruleset.recordType}/${version}`);
  };

  const onLaunchTests = () => {
    setViewBatchTest(true);
    startDryRun.mutate(ruleset.recordType, {
      onError: () => {
        toast.error(t('common:errors.unknown'));
        if (lastDryRun == null) setViewBatchTest(false);
      },
    });
  };

  return (
    <div className={cn('flex flex-col lg:flex-row w-full', pageLayoutGutter.gap)}>
      <Card className="p-md flex flex-col gap-md flex-1">
        <div className="flex items-center justify-between gap-sm">
          <div>
            <span className="text-h3 font-semibold text-grey-primary">{t('user-scoring:ruleset.title')}</span>
          </div>
          <div className="flex items-center gap-sm">
            <SelectV2
              options={versionOptions}
              placeholder={t('user-scoring:ruleset.version_placeholder')}
              value={ruleset.status === 'draft' ? 'draft' : ruleset.version.toString()}
              onChange={handleVersionChange}
              variant="tag"
              menuClassName="min-w-30"
            />
            {ruleset.status === 'draft' && (
              <BatchTest onLaunchTest={onLaunchTests} isLaunching={startDryRun.isPending} />
            )}
            {preparationStatus ? (
              preparationStatus.status === 'required' ? (
                <Button
                  disabled={
                    preparationStatus.serviceStatus === 'occupied' ||
                    prepareMutation.isPending ||
                    ruleset.rules.length === 0
                  }
                  onClick={() =>
                    prepareMutation.mutate(ruleset.recordType, {
                      onError: () => toast.error(t('common:errors.unknown')),
                    })
                  }
                >
                  {t('user-scoring:ruleset.prepare')}
                </Button>
              ) : (
                <Button
                  disabled={commitMutation.isPending || ruleset.rules.length === 0}
                  onClick={() =>
                    commitMutation.mutate(ruleset.recordType, {
                      onError: () => toast.error(t('common:errors.unknown')),
                    })
                  }
                >
                  <Icon icon="commit" className="size-4" />
                  {t('user-scoring:ruleset.commit')}
                </Button>
              )
            ) : null}
            <Button variant="secondary" mode="icon" onClick={() => setEditPanelOpen(true)}>
              <Icon icon="edit" className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-md text-s text-grey-secondary">
          <span>
            {t('user-scoring:ruleset.last_update')}&nbsp;
            <span className="text-grey-primary">
              {formatDateTime(ruleset.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </span>
          {cooldownLabel ? (
            <>
              <span className="text-grey-border">|</span>
              <span>
                {t('user-scoring:ruleset.cooldown')} <span className="text-grey-primary">{cooldownLabel}</span>
              </span>
            </>
          ) : null}
          {scoringIntervalLabel ? (
            <>
              <span className="text-grey-border">|</span>
              <span>
                {t('user-scoring:ruleset.score_renew')}&nbsp;
                <span className="text-grey-primary">{scoringIntervalLabel}</span>
              </span>
            </>
          ) : null}
        </div>

        <RiskLevelBadges maxRiskLevel={settings.maxRiskLevel} thresholds={ruleset.thresholds} />

        <Panel.Root open={editPanelOpen} onOpenChange={setEditPanelOpen}>
          <EditGeneralSettingsPanel ruleset={ruleset} maxRiskLevel={settings.maxRiskLevel} />
        </Panel.Root>
      </Card>
      {viewBatchTest || lastDryRun != null ? (
        <ScoringBatchTest ruleset={ruleset} settings={settings} lastDryRun={newDryRun?.dryRun ?? lastDryRun} />
      ) : null}
    </div>
  );
}

function DurationDaysField({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (seconds: number | undefined) => void;
}) {
  const { t } = useTranslation(['common']);
  const [days, setDays] = useState(value !== undefined ? value / SECONDS_PER_UNIT.days : 0);

  return (
    <>
      <NumberInput
        className="max-w-15"
        borderColor={days < 1 ? 'redfigma-47' : 'greyfigma-90'}
        value={days}
        onChange={(v) => {
          setDays(v);
          onChange(v > 0 ? v * SECONDS_PER_UNIT.days : undefined);
        }}
      />
      <span className="text-grey-secondary">{t('common:duration_unit.days')}</span>
    </>
  );
}

function EditGeneralSettingsPanel({
  ruleset,
  maxRiskLevel,
}: {
  ruleset: ScoringRulesetWithRules;
  maxRiskLevel: number;
}) {
  const { t } = useTranslation(['common', 'user-scoring']);
  const router = useRouter();
  const navigate = useNavigate();
  const updateMutation = useUpdateScoringRulesetMutation();
  const panelSharp = PanelSharpFactory.useSharp();
  const form = useForm({
    defaultValues: {
      id: ruleset.id,
      recordType: ruleset.recordType,
      name: ruleset.name,
      thresholds: ruleset.thresholds,
      cooldownSeconds: ruleset.cooldownSeconds,
      scoringIntervalSeconds: ruleset.scoringIntervalSeconds,
      rules: ruleset.rules.map((r) => ({
        stableId: r.stableId,
        name: r.name,
        description: r.description,
        riskType: r.riskType,
        ast: r.ast,
      })),
    } as UpdateScoringRulesetPayload,
    validators: {
      onChange: updateScoringRulesetPayloadSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      if (formApi.state.isValid) {
        try {
          await updateMutation.mutateAsync(value);
          toast.success(t('common:success.save'));
          panelSharp.actions.close();
          await router.invalidate();
          navigate({
            to: '/user-scoring/$recordType/$version',
            params: { recordType: ruleset.recordType, version: 'draft' },
          });
        } catch {
          toast.error(t('common:errors.unknown'));
        }
      }
    },
  });

  return (
    <Panel.Container size="small">
      <form className="contents" onSubmit={handleSubmit(form)}>
        <Panel.Content>
          <Panel.Header>{t('user-scoring:ruleset.edit_settings_title')}</Panel.Header>
          <div className="flex flex-col gap-md">
            <div className="flex flex-col gap-sm">
              {t('user-scoring:section.create_panel.general_settings')}
              <div className="border border-grey-border rounded-md p-md grid grid-cols-[1fr_repeat(3,_auto)] gap-x-sm gap-y-md">
                <div className="grid grid-cols-subgrid col-span-full items-center">
                  <span className="text-s">{t('user-scoring:section.create_panel.lower_score_duration')}</span>
                  <form.Field name="cooldownSeconds">
                    {(field) => <DurationDaysField value={field.state.value} onChange={field.handleChange} />}
                  </form.Field>
                  <Tooltip.Default content={t('user-scoring:section.create_panel.lower_score_duration_tooltip')}>
                    <Icon icon="helpcenter" className="size-5 text-grey-secondary" />
                  </Tooltip.Default>
                </div>
                <div className="grid grid-cols-subgrid col-span-full items-center">
                  <span className="text-s">{t('user-scoring:section.create_panel.recalculation_duration')}</span>
                  <form.Field name="scoringIntervalSeconds">
                    {(field) => <DurationDaysField value={field.state.value} onChange={field.handleChange} />}
                  </form.Field>
                  <Tooltip.Default content={t('user-scoring:section.create_panel.recalculation_duration_tooltip')}>
                    <Icon icon="helpcenter" className="size-5 text-grey-secondary" />
                  </Tooltip.Default>
                </div>
              </div>
            </div>
            <form.Field name="thresholds">
              {(field) => (
                <ScoringLevelThresholds
                  maxRiskLevel={maxRiskLevel}
                  thresholds={field.state.value}
                  onThresholdsChange={field.handleChange}
                />
              )}
            </form.Field>
          </div>
          <Panel.Footer>
            <Panel.FooterButton
              variant="secondary"
              onClick={() => panelSharp.actions.close()}
              label={t('user-scoring:section.create_panel.cancel')}
            />
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Panel.FooterButton
                  disabled={!canSubmit}
                  isLoading={isSubmitting}
                  type="submit"
                  label={t('user-scoring:section.create_panel.validate')}
                />
              )}
            </form.Subscribe>
          </Panel.Footer>
        </Panel.Content>
      </form>
    </Panel.Container>
  );
}

function RiskLevelBadges({ maxRiskLevel, thresholds }: { maxRiskLevel: number; thresholds: number[] }) {
  const { t } = useTranslation(['user-scoring']);
  if (!isMaxRiskLevelInRange(maxRiskLevel)) {
    return null;
  }

  const colorEntries = scoringLevelEntries(SCORING_LEVELS_COLORS[maxRiskLevel]);
  const labelKeys = SCORING_LEVELS_LABEL_KEYS[maxRiskLevel];

  return (
    <div className="flex flex-col gap-sm">
      <span className="text-s text-grey-secondary">{t('user-scoring:ruleset.risk_level')}</span>
      <div className="flex items-center gap-sm">
        {colorEntries.map(([level, color], i) => {
          const isLast = i === colorEntries.length - 1;
          return (
            <Fragment key={level}>
              <div className="flex items-center gap-xs h-6 px-xs rounded-full border" style={{ borderColor: color }}>
                <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-grey-primary">{t(labelKeys[level] ?? '')}</span>
              </div>
              {!isLast ? (
                <span className="text-xs font-medium text-grey-placeholder">{`≤ ${thresholds[i]} <`}</span>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function BatchTest({ onLaunchTest, isLaunching }: { onLaunchTest: () => void; isLaunching: boolean }) {
  const { t } = useTranslation(['user-scoring', 'common']);
  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button variant="primary" appearance="stroked">
          {t('user-scoring:ruleset.batch_test_button')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('user-scoring:ruleset.batch_test_title')}</Modal.Title>
        <div className="flex flex-col gap-sm p-md">
          <p>{t('user-scoring:ruleset.batch_test_description1')}</p>
          <p>{t('user-scoring:ruleset.batch_test_description2')}</p>
        </div>
        <Modal.Footer>
          <Modal.FooterButton variant="secondary" isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            variant="primary"
            onClick={onLaunchTest}
            isCloseButton
            isLoading={isLaunching}
            label={t('user-scoring:ruleset.batch_test_run')}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
