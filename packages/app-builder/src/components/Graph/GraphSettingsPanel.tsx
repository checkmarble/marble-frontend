import { ClientObjectTagList } from '@app-builder/components/Annotations/ClientObjectTagList';
import { ClientComments } from '@app-builder/components/ClientDetail/ClientComments';
import { ScoreDetailPanel } from '@app-builder/components/ClientDetail/ScoreDetailPanel';
import { DataFields } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { SCORING_LEVELS_COLORS, SCORING_LEVELS_LABEL_KEYS, type ScoringSettings } from '@app-builder/models/scoring';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useScoreLatestQuery } from '@app-builder/queries/scoring/get-score-latest';
import { useScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import { type ScoringScore } from 'marble-api';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import { Button, Checkbox, type CheckedState, MenuCommand, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import {
  GRAPH_ATTRIBUTE_LABELS,
  GRAPH_ATTRIBUTES,
  type GraphAttribute,
  useCustomerGraph,
} from './CustomerGraphContext';
import { resolveTitle } from './resolve-object-title';

function attributesLabel(attributes: GraphAttribute[]): string {
  if (attributes.length === 0) return 'Attributes: none';
  if (attributes.length === GRAPH_ATTRIBUTES.length) {
    return `Attributes: ${GRAPH_ATTRIBUTES.map((a) => GRAPH_ATTRIBUTE_LABELS[a]).join(', ')}`;
  }
  return `Attributes: ${attributes.map((a) => GRAPH_ATTRIBUTE_LABELS[a]).join(', ')}`;
}

function asBoolean(value: CheckedState): boolean {
  return value === true;
}

function DetailCardSkeleton() {
  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-wrap items-center gap-sm">
        <div className="bg-grey-border h-4 w-28 animate-pulse rounded-md" />
        <div className="bg-grey-border h-5 w-24 animate-pulse rounded-full" />
      </div>
      <div className="flex flex-wrap gap-xs">
        <div className="bg-grey-border h-5 w-16 animate-pulse rounded-full" />
        <div className="bg-grey-border h-5 w-14 animate-pulse rounded-full" />
      </div>
      <div className="flex flex-col gap-xs">
        <div className="bg-grey-border h-6 w-full animate-pulse rounded-sm" />
        <div className="bg-grey-border h-6 w-full animate-pulse rounded-sm" />
        <div className="bg-grey-border h-6 w-3/4 animate-pulse rounded-sm" />
      </div>
    </div>
  );
}

function RiskBadgeSkeleton() {
  return <div className="bg-grey-border h-5 w-24 animate-pulse rounded-full" />;
}

function QueryError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation(['common']);
  return (
    <div className="flex flex-col items-start gap-xs">
      <span className="text-grey-secondary text-xs">{t('common:generic_fetch_data_error')}</span>
      <Button variant="secondary" size="small" onClick={onRetry}>
        {t('common:retry')}
      </Button>
    </div>
  );
}

function RiskBadge({
  objectType,
  score,
  scoringSettings,
}: {
  objectType: string;
  score: ScoringScore;
  scoringSettings: ScoringSettings;
}) {
  const { t } = useTranslation(['cases', 'user-scoring']);
  const [panelOpen, setPanelOpen] = useState(false);

  const maxRiskLevel = scoringSettings.maxRiskLevel as 3 | 4 | 5 | 6;
  const scoreColor = SCORING_LEVELS_COLORS[maxRiskLevel][score.risk_level] ?? 'inherit';
  const scoreLabel = t(SCORING_LEVELS_LABEL_KEYS[maxRiskLevel][score.risk_level] ?? score.risk_level.toString());

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="inline-flex cursor-pointer items-center gap-xs rounded-full border px-sm py-px text-xs"
        style={{ backgroundColor: `${scoreColor}20`, borderColor: scoreColor }}
      >
        <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: scoreColor }} />
        <span>
          {t('cases:manager.client.risk_label')} <strong>{scoreLabel}</strong>
        </span>
        <Icon icon="visibility" className="size-3" />
      </button>
      <ScoreDetailPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        objectType={objectType}
        activeScore={score}
        scoringSettings={scoringSettings}
      />
    </>
  );
}

export function GraphSettingsPanel() {
  const {
    showPersons,
    setShowPersons,
    showCompanies,
    setShowCompanies,
    attributes,
    toggleAttribute,
    showRiskScore,
    setShowRiskScore,
    showTags,
    setShowTags,
    selectedObject,
  } = useCustomerGraph();

  const objectType = selectedObject?.objectType ?? '';
  const objectId = selectedObject?.objectId ?? '';
  const hasSelection = !!selectedObject;
  const asideRef = useRef<HTMLElement>(null);

  const detailsQuery = useObjectDetailsQuery(objectType, objectId, hasSelection);
  const scoreQuery = useScoreLatestQuery(objectType, objectId);
  const settingsQuery = useScoringSettingsQuery();
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId);

  return (
    <aside
      ref={asideRef}
      className="border-grey-border bg-grey-white flex min-h-0 flex-col gap-md overflow-y-auto rounded-lg border p-md h-fit min-w-md"
    >
      <div className="flex flex-wrap items-center gap-md">
        <label htmlFor="filter-persons" className="flex cursor-pointer items-center gap-sm text-sm">
          <Checkbox
            id="filter-persons"
            size="small"
            checked={showPersons}
            onCheckedChange={(v) => setShowPersons(asBoolean(v))}
          />
          Persons
        </label>
        <label htmlFor="filter-companies" className="flex cursor-pointer items-center gap-sm text-sm">
          <Checkbox
            id="filter-companies"
            size="small"
            checked={showCompanies}
            onCheckedChange={(v) => setShowCompanies(asBoolean(v))}
          />
          Companies
        </label>
      </div>

      <MenuCommand.Menu persistOnSelect>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton className="w-full" size="small">
            {attributesLabel(attributes)}
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth align="start" sideOffset={4}>
          <MenuCommand.List>
            {GRAPH_ATTRIBUTES.map((attribute) => {
              const checked = attributes.includes(attribute);
              return (
                <MenuCommand.Item
                  key={attribute}
                  value={attribute}
                  className="flex items-center gap-sm"
                  onSelect={() => toggleAttribute(attribute)}
                >
                  <label htmlFor={attribute} className="flex cursor-pointer items-center gap-sm text-sm">
                    <Checkbox id={attribute} size="small" checked={checked} />
                    {GRAPH_ATTRIBUTE_LABELS[attribute]}
                  </label>
                </MenuCommand.Item>
              );
            })}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>

      <div className="border-grey-border bg-grey-background-light flex flex-col gap-sm rounded-md border p-md">
        {hasSelection ? (
          <>
            {match(detailsQuery)
              .with({ isError: true }, () => <QueryError onRetry={() => detailsQuery.refetch()} />)
              .with({ isPending: true }, () => <DetailCardSkeleton />)
              .with({ isSuccess: true }, ({ data: objectDetails }) => {
                const title = resolveTitle(objectDetails.data, objectId);

                return (
                  <>
                    <div className="flex flex-wrap items-center gap-sm">
                      <span className="text-purple-primary text-sm font-semibold">{title}</span>
                      {showRiskScore
                        ? match({ scoreQuery, settingsQuery })
                            .with({ scoreQuery: { isError: true } }, () => null)
                            .with(
                              P.union({ scoreQuery: { isPending: true } }, { settingsQuery: { isPending: true } }),
                              () => <RiskBadgeSkeleton />,
                            )
                            .with(
                              {
                                scoreQuery: { isSuccess: true, data: { score: P.nonNullable } },
                                settingsQuery: { isSuccess: true, data: { settings: P.nonNullable } },
                              },
                              ({
                                scoreQuery: {
                                  data: { score },
                                },
                                settingsQuery: {
                                  data: { settings },
                                },
                              }) => <RiskBadge objectType={objectType} score={score} scoringSettings={settings} />,
                            )
                            .otherwise(() => null)
                        : null}
                    </div>

                    {showTags ? <ClientObjectTagList tableName={objectType} objectId={objectId} /> : null}

                    <DataFields
                      table={objectType}
                      object={objectDetails}
                      options={{ hideLinks: true, maxVisibleFields: 6, displayExpandButton: true }}
                    />
                  </>
                );
              })
              .exhaustive()}
            <ClientComments
              objectType={objectType}
              objectId={objectId}
              annotationsQuery={annotationsQuery}
              root={asideRef}
            />
          </>
        ) : (
          <p className="text-grey-secondary text-xs">Select a node to see details.</p>
        )}
      </div>

      <div className="flex flex-col gap-sm">
        <div className="flex items-center justify-between gap-sm">
          <label htmlFor="show-risk-score" className="text-grey-primary cursor-pointer text-sm">
            Show risk score
          </label>
          <Switch id="show-risk-score" checked={showRiskScore} onCheckedChange={setShowRiskScore} />
        </div>
        <div className="flex items-center justify-between gap-sm">
          <label htmlFor="show-tags" className="text-grey-primary cursor-pointer text-sm">
            Show tags
          </label>
          <Switch id="show-tags" checked={showTags} onCheckedChange={setShowTags} />
        </div>
      </div>
    </aside>
  );
}
