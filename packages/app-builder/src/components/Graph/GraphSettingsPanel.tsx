import { ClientObjectTagList } from '@app-builder/components/Annotations/ClientObjectTagList';
import { ClientComments } from '@app-builder/components/ClientDetail/ClientComments';
import { ScoreDetailPanel } from '@app-builder/components/ClientDetail/ScoreDetailPanel';
import { DataFields } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { SCORING_LEVELS_COLORS, SCORING_LEVELS_LABEL_KEYS, type ScoringSettings } from '@app-builder/models/scoring';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useScoreLatestQuery } from '@app-builder/queries/scoring/get-score-latest';
import { useScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { type ScoringScore } from 'marble-api';
import { type ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import {
  Button,
  Checkbox,
  type CheckedState,
  ExpandableGroupTagLine,
  MenuCommand,
  Switch,
  Tag,
  ThresholdRange,
} from 'ui-design-system';
import { Icon } from 'ui-icons';
import {
  CLUSTER_THRESHOLD_OPTIONS,
  type ClusterThreshold,
  GRAPH_ATTRIBUTE_LABELS,
  GRAPH_ATTRIBUTES,
  type GraphAttribute,
  type GraphPersonRef,
  useCustomerGraph,
} from './CustomerGraphContext';
import { resolveTitle } from './resolve-object-title';

function isClusterThreshold(value: number): value is ClusterThreshold {
  return (CLUSTER_THRESHOLD_OPTIONS as readonly number[]).includes(value);
}

function clusterThresholdLabel(value: number): string {
  return value === 0 ? 'Off' : String(value);
}

function ClusterThresholdControl() {
  const { clusterThreshold, setClusterThreshold } = useCustomerGraph();

  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="w-full" size="medium">
          Cluster threshold: {clusterThresholdLabel(clusterThreshold)}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth align="start" sideOffset={4} className="min-w-72">
        <div className="p-md" onPointerDown={(event) => event.stopPropagation()}>
          <ThresholdRange
            title="Cluster at"
            defaultDescription="Collapse branches with at least this many nodes. Off keeps every node expanded."
            value={clusterThreshold}
            onChange={(value) => {
              if (isClusterThreshold(value)) setClusterThreshold(value);
            }}
            values={CLUSTER_THRESHOLD_OPTIONS.map((option) => ({
              value: option,
              label: option === 0 ? 'Off — no clustering' : `Cluster branches of ${option}+ nodes`,
              color: 'var(--color-purple-primary)',
            }))}
            initialColor="var(--color-purple-primary)"
            max={CLUSTER_THRESHOLD_OPTIONS.at(-1)}
          />
        </div>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

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

function ConnectedPersonRisk({ objectType, objectId }: GraphPersonRef) {
  const scoreQuery = useScoreLatestQuery(objectType, objectId);
  const settingsQuery = useScoringSettingsQuery();

  return match({ scoreQuery, settingsQuery })
    .with({ scoreQuery: { isError: true } }, () => null)
    .with(P.union({ scoreQuery: { isPending: true } }, { settingsQuery: { isPending: true } }), () => (
      <RiskBadgeSkeleton />
    ))
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
    .otherwise(() => null);
}

function ConnectedPersonTags({ objectType, objectId }: GraphPersonRef) {
  const { orgObjectTags } = useOrganizationObjectTags();
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId);

  if (annotationsQuery.isPending) {
    return (
      <div className="flex flex-wrap gap-xs">
        <div className="bg-grey-border h-5 w-16 animate-pulse rounded-full" />
        <div className="bg-grey-border h-5 w-14 animate-pulse rounded-full" />
      </div>
    );
  }

  if (annotationsQuery.isError) return null;

  const tagIds = annotationsQuery.data.annotations.tags.map((annotation) => annotation.payload.tag_id);
  const tags = tagIds
    .map((tagId) => orgObjectTags.find((tag) => tag.id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => tag != null);

  if (tags.length === 0) return null;

  const tagItems = tags.map((tag) => (
    <Tag key={tag.id} size="small" color="purple">
      <div className="size-3 shrink-0 rounded-full me-xs" style={{ backgroundColor: tag.color }} />
      {tag.name}
    </Tag>
  ));

  return (
    <ExpandableGroupTagLine
      items={tagItems}
      classname="gap-xs"
      overflowBehavior="popover"
      moreButton={(overflow, onExpand) => (
        <Tag color="purple" size="small" className="cursor-pointer shrink-0" onClick={onExpand}>
          +{overflow}
        </Tag>
      )}
    />
  );
}

function ConnectedPersonRow({
  person,
  showRiskScore,
  showTags,
}: {
  person: GraphPersonRef;
  showRiskScore: boolean;
  showTags: boolean;
}) {
  const detailsQuery = useObjectDetailsQuery(person.objectType, person.objectId);
  const title = match(detailsQuery)
    .with({ isSuccess: true }, ({ data }) => resolveTitle(data.data, person.objectId))
    .otherwise(() => person.objectId);

  return (
    <li>
      <div className="flex flex-col gap-xs">
        <div className="flex flex-wrap items-center gap-sm">
          <span className="text-sm font-semibold">{title}</span>
          {showRiskScore ? <ConnectedPersonRisk {...person} /> : null}
        </div>
        {showTags ? <ConnectedPersonTags {...person} /> : null}
      </div>
    </li>
  );
}

const CONNECTED_PERSONS_PREVIEW_COUNT = 5;

/** Preview-capped person list, shared by the pivot and cluster detail cards. */
function PersonListDetail({
  header,
  persons,
  showRiskScore,
  showTags,
}: {
  header: ReactNode;
  persons: GraphPersonRef[];
  showRiskScore: boolean;
  showTags: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const total = persons.length;
  const hasMore = total > CONNECTED_PERSONS_PREVIEW_COUNT;
  const displayedPersons = showAll || !hasMore ? persons : persons.slice(0, CONNECTED_PERSONS_PREVIEW_COUNT);
  const showTotalTag = total > displayedPersons.length;

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-start justify-between gap-sm">
        {header}
        {showTotalTag ? (
          <Tag size="small" color="grey">
            {total} items
          </Tag>
        ) : null}
      </div>
      {total === 0 ? (
        <p className="text-grey-secondary text-xs">No connected nodes.</p>
      ) : (
        <>
          <ul className="list-outside list-disc space-y-sm ps-md">
            {displayedPersons.map((person) => (
              <ConnectedPersonRow
                key={`${person.objectType}:${person.objectId}`}
                person={person}
                showRiskScore={showRiskScore}
                showTags={showTags}
              />
            ))}
          </ul>
          {hasMore ? (
            <Button variant="secondary" size="small" onClick={() => setShowAll((prev) => !prev)}>
              {showAll ? 'Show less' : 'Show more'}
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

function PivotDetail({
  objectType,
  objectId,
  connectedPersons,
  showRiskScore,
  showTags,
}: {
  objectType: string;
  objectId: string;
  connectedPersons: GraphPersonRef[];
  showRiskScore: boolean;
  showTags: boolean;
}) {
  return (
    <PersonListDetail
      header={
        <div className="min-w-0">
          <div className="text-grey-secondary text-xs leading-none">{objectType}</div>
          <div className="text-orange-primary truncate text-sm font-semibold">{objectId}</div>
        </div>
      }
      persons={connectedPersons}
      showRiskScore={showRiskScore}
      showTags={showTags}
    />
  );
}

function ClusterDetail({
  nodeCount,
  internalEdgeCount,
  members,
  showRiskScore,
  showTags,
}: {
  nodeCount: number;
  internalEdgeCount: number;
  members: GraphPersonRef[];
  showRiskScore: boolean;
  showTags: boolean;
}) {
  return (
    <PersonListDetail
      header={
        <div className="min-w-0">
          <div className="text-grey-secondary text-xs leading-none">Grouped branch</div>
          <div className="text-grey-primary truncate text-sm font-semibold">
            {nodeCount} nodes · {internalEdgeCount} edges
          </div>
        </div>
      }
      persons={members}
      showRiskScore={showRiskScore}
      showTags={showTags}
    />
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
    graphStats,
    restoreHiddenNodes,
  } = useCustomerGraph();

  const objectType = selectedObject?.objectType ?? '';
  const objectId = selectedObject?.objectId ?? '';
  const hasSelection = !!selectedObject;
  const asideRef = useRef<HTMLElement>(null);

  const detailsQuery = useObjectDetailsQuery(
    objectType,
    objectId,
    hasSelection && selectedObject.nodeType === 'person',
  );
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

      {graphStats.hiddenCount > 0 ? (
        <Button variant="secondary" appearance="stroked" size="small" onClick={restoreHiddenNodes}>
          <Icon icon="eye" className="size-4" />
          Show {graphStats.hiddenCount} hidden nodes
        </Button>
      ) : null}

      <div className="border-grey-border bg-grey-background-light flex flex-col gap-sm rounded-md border p-md">
        {hasSelection ? (
          match(selectedObject)
            .with({ nodeType: 'person' }, () => (
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
            ))
            .with({ nodeType: 'pivot' }, (pivot) => (
              <PivotDetail
                objectType={pivot.objectType}
                objectId={pivot.objectId}
                connectedPersons={pivot.connectedPersons}
                showRiskScore={showRiskScore}
                showTags={showTags}
              />
            ))
            .with({ nodeType: 'cluster' }, (cluster) => (
              <ClusterDetail
                nodeCount={cluster.nodeCount}
                internalEdgeCount={cluster.internalEdgeCount}
                members={cluster.members}
                showRiskScore={showRiskScore}
                showTags={showTags}
              />
            ))
            .exhaustive()
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
        <ClusterThresholdControl />
      </div>
    </aside>
  );
}
