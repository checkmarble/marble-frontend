import { ClientObjectTagList } from '@app-builder/components/Annotations/ClientObjectTagList';
import { ClientComments } from '@app-builder/components/ClientDetail/ClientComments';
import { ScoreDetailPanel } from '@app-builder/components/ClientDetail/ScoreDetailPanel';
import { DataFields } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { Spinner } from '@app-builder/components/Spinner';
import { SCORING_LEVELS_COLORS, SCORING_LEVELS_LABEL_KEYS } from '@app-builder/models/scoring';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useScoreLatestQuery } from '@app-builder/queries/scoring/get-score-latest';
import { useDataModel } from '@app-builder/services/data/data-model';
import { LAYOUT_NAMES } from 'ego-graph';
import { type ReactNode, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import { Button, Checkbox, cn, MenuCommand, Panel, Switch, Tag, ThresholdRange } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { useGraphAnnotationsActions } from './contexts/GraphAnnotationsContext';
import { useSelectedObject, useSetSelectedObject } from './contexts/GraphFocusContext';
import { useGraphInteractionActions, useIsNodeChecked, useSelectionMode } from './contexts/GraphInteractionContext';
import { useGraphSession } from './contexts/GraphSessionContext';
import { useGraphStats } from './contexts/GraphStatsContext';
import { useGraphStructureActions } from './contexts/GraphStructureContext';
import {
  CLUSTER_THRESHOLD_OPTIONS,
  type ClusterThreshold,
  useGraphViewSettings,
} from './contexts/GraphViewSettingsContext';
import { subEntityIcon } from './GraphComponents';
import { GraphMultiFilterSelect } from './GraphMultiFilterSelect';
import { GraphTabSwitch, tabSwitchOptions } from './GraphTabSwitch';
import { graphI18n } from './lib/graph-i18n';
import { type GraphObjectRef, nodeKey } from './lib/graph-keys';
import { type GraphLayoutMode } from './lib/graph-layout';
import { tableFilterOptions } from './lib/graph-query-filters';
import { resolveTitle } from './lib/resolve-object-title';
import { ObjectTagLine, ObjectTagLineSkeleton, useObjectTags } from './ObjectTags';

function isClusterThreshold(value: number): value is ClusterThreshold {
  return (CLUSTER_THRESHOLD_OPTIONS as readonly number[]).includes(value);
}

const LAYOUT_MODE_KEYS = {
  polarPetal: 'graph:layout.polar_petal',
  radialDagre: 'graph:layout.radial_dagre',
  sectoredDagre: 'graph:layout.sectored_dagre',
} as const satisfies Record<GraphLayoutMode, string>;

const LAYOUT_MODE_ICONS = {
  polarPetal: 'radial-petals',
  radialDagre: 'radial-dagre',
  sectoredDagre: 'radial-adptative',
} as const satisfies Record<GraphLayoutMode, IconName>;

function ClusterThresholdControl() {
  const { t } = useTranslation(graphI18n);
  const { clusterThreshold, setClusterThreshold } = useGraphViewSettings();
  const thresholdValue = clusterThreshold === 0 ? t('graph:cluster.threshold.off') : String(clusterThreshold);

  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="w-full" size="medium">
          {t('graph:cluster.threshold.button', { value: thresholdValue })}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth align="start" sideOffset={4} className="min-w-72">
        <div className="p-md" onPointerDown={(event) => event.stopPropagation()}>
          <ThresholdRange
            title={t('graph:cluster.threshold.title')}
            defaultDescription={t('graph:cluster.threshold.description')}
            value={clusterThreshold}
            onChange={(value) => {
              if (isClusterThreshold(value)) setClusterThreshold(value);
            }}
            values={CLUSTER_THRESHOLD_OPTIONS.map((option) => ({
              value: option,
              label:
                option === 0
                  ? t('graph:cluster.threshold.option_off')
                  : t('graph:cluster.threshold.option', { count: option }),
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

function LayoutModeControl() {
  const { t } = useTranslation(graphI18n);
  const { layoutMode, setLayoutMode } = useGraphViewSettings();

  return (
    <GraphTabSwitch
      value={layoutMode}
      options={tabSwitchOptions(LAYOUT_NAMES, (mode) => t(LAYOUT_MODE_KEYS[mode]), LAYOUT_MODE_ICONS)}
      onChange={setLayoutMode}
    />
  );
}

function DetailCardSkeleton() {
  return (
    <div className="flex flex-col gap-sm">
      <ObjectTagLineSkeleton />
      <div className="flex flex-col gap-xs">
        <div className="bg-grey-border h-6 w-full animate-pulse rounded-sm" />
        <div className="bg-grey-border h-6 w-full animate-pulse rounded-sm" />
        <div className="bg-grey-border h-6 w-3/4 animate-pulse rounded-sm" />
      </div>
    </div>
  );
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

/** Live score + ruleset breakdown; mounted only once the badge is clicked. */
function ScoreDetailFetchPanel({
  open,
  onOpenChange,
  objectType,
  objectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectType: string;
  objectId: string;
}) {
  const { t } = useTranslation(['client360']);
  const { scoringSettings } = useGraphViewSettings();
  const scoreQuery = useScoreLatestQuery(objectType, objectId);

  if (scoringSettings == null) return null;

  return match(scoreQuery)
    .with({ isSuccess: true, data: { score: P.nonNullable } }, ({ data: { score } }) => (
      <ScoreDetailPanel
        open={open}
        onOpenChange={onOpenChange}
        objectType={objectType}
        activeScore={score}
        scoringSettings={scoringSettings}
      />
    ))
    .otherwise(() => (
      <Panel.Root open={open} onOpenChange={onOpenChange}>
        <Panel.Container size="small">
          <Panel.Content className="flex flex-col gap-lg">
            {scoreQuery.isError ? (
              <QueryError onRetry={() => scoreQuery.refetch()} />
            ) : scoreQuery.isSuccess ? (
              <p className="text-s text-grey-secondary">
                {t('client360:client_detail.score_panel.evaluation_unavailable')}
              </p>
            ) : (
              <div className="flex justify-center py-md">
                <Spinner className="size-6" />
              </div>
            )}
          </Panel.Content>
        </Panel.Container>
      </Panel.Root>
    ));
}

/** Metadata risk level as a badge; the live score is fetched only when the panel opens. */
function ObjectRiskBadge({ objectType, objectId, riskLevel }: GraphObjectRef) {
  const { t } = useTranslation(['cases', 'user-scoring']);
  const { maxRiskLevel } = useGraphViewSettings();
  const [panelOpen, setPanelOpen] = useState(false);

  if (riskLevel == null || maxRiskLevel == null) return null;

  const scoreColor = SCORING_LEVELS_COLORS[maxRiskLevel][riskLevel] ?? 'inherit';
  const scoreLabel = t(SCORING_LEVELS_LABEL_KEYS[maxRiskLevel][riskLevel] ?? riskLevel.toString());

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setPanelOpen(true);
        }}
        className="inline-flex cursor-pointer items-center gap-xs rounded-full border px-sm py-px text-xs"
        style={{ backgroundColor: `${scoreColor}20`, borderColor: scoreColor }}
      >
        <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: scoreColor }} />
        <span>
          {t('cases:manager.client.risk_label')} <strong>{scoreLabel}</strong>
        </span>
        <Icon icon="visibility" className="size-3" />
      </button>
      {panelOpen ? (
        <ScoreDetailFetchPanel
          open={panelOpen}
          onOpenChange={setPanelOpen}
          objectType={objectType}
          objectId={objectId}
        />
      ) : null}
    </>
  );
}

function ObjectTags({ objectType, objectId }: GraphObjectRef) {
  const { isPending, tags } = useObjectTags(objectType, objectId);

  if (isPending) return <ObjectTagLineSkeleton />;
  if (tags.length === 0) return null;
  return <ObjectTagLine tags={tags} />;
}

function PersonRow({ person, showTags }: { person: GraphObjectRef; showTags: boolean }) {
  const setSelectedObject = useSetSelectedObject();
  const { hoverNode } = useGraphInteractionActions();
  const selectionMode = useSelectionMode();
  const nk = nodeKey(person.objectType, person.objectId);
  const isNodeChecked = useIsNodeChecked(nk);
  const { toggleCheckedNode } = useGraphInteractionActions();

  const title = resolveTitle(person.label, person.objectId);
  const id = nodeKey(person.objectType, person.objectId);

  function handleClick() {
    if (selectionMode) return;
    setSelectedObject({ ...person, nodeType: 'person', persons: [person] });
  }

  return (
    <li
      className="-mx-xs rounded-sm px-xs py-2xs transition-colors border border-transparent hover:bg-purple-background-light hover:border hover:border-purple-border cursor-pointer"
      onMouseEnter={() => {
        if (!selectionMode) hoverNode(id);
      }}
      onMouseLeave={() => hoverNode(null)}
      onClick={handleClick}
    >
      <div className="flex flex-col gap-xs">
        <label className="flex flex-wrap items-center gap-sm" htmlFor={nk}>
          {selectionMode && (
            <Checkbox size="small" checked={isNodeChecked} onCheckedChange={() => toggleCheckedNode(nk)} id={nk} />
          )}
          <Icon icon={subEntityIcon(person)} className="size-4 shrink-0 text-purple-primary" />
          <span className="text-sm">{title}</span>
          <ObjectRiskBadge {...person} />
        </label>
        {showTags ? <ObjectTags {...person} /> : null}
      </div>
    </li>
  );
}

const PERSON_LIST_PREVIEW_COUNT = 5;

/** Preview-capped person list, shared by the person, pivot, and cluster detail cards. */
function PersonListDetail({
  header,
  persons,
  showTags,
}: {
  header: ReactNode;
  persons: GraphObjectRef[];
  showTags: boolean;
}) {
  const { t } = useTranslation(graphI18n);
  const [showAll, setShowAll] = useState(false);
  const total = persons.length;
  const hasMore = total > PERSON_LIST_PREVIEW_COUNT;
  const displayedPersons = showAll || !hasMore ? persons : persons.slice(0, PERSON_LIST_PREVIEW_COUNT);

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-start justify-between gap-sm">
        {header}
        {total > displayedPersons.length ? (
          <Tag size="small" color="grey">
            {t('graph:panel.items', { count: total })}
          </Tag>
        ) : null}
      </div>
      {total === 0 ? (
        <p className="text-grey-secondary text-xs">{t('graph:panel.no_connected_nodes')}</p>
      ) : (
        <>
          <ul className="space-y-sm ps-md">
            {displayedPersons.map((person) => (
              <PersonRow key={nodeKey(person.objectType, person.objectId)} person={person} showTags={showTags} />
            ))}
          </ul>
          {hasMore ? (
            <Button variant="secondary" size="small" onClick={() => setShowAll((prev) => !prev)}>
              {showAll ? t('graph:panel.show_less') : t('graph:panel.show_more')}
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

export function GraphSettingsPanel() {
  const { t } = useTranslation(graphI18n);
  const dataModel = useDataModel();
  const {
    selectedTableNames,
    toggleTableName,
    relationGroups,
    selectedRelationGroupIds,
    toggleRelationGroup,
    isFilterDirty,
    refreshGraph,
    isGeneratingGraph,
  } = useGraphSession();
  const { showRiskScore, setShowRiskScore, showTags, setShowTags, showHypernodes, setShowHypernodes } =
    useGraphViewSettings();
  const selectedObject = useSelectedObject();
  const { restoreHiddenNodes } = useGraphStructureActions();
  const { setNodeTagIds } = useGraphAnnotationsActions();
  const graphStats = useGraphStats();

  const objectType = selectedObject?.objectType ?? '';
  const objectId = selectedObject?.objectId ?? '';
  const hasSelection = !!selectedObject;
  const asideRef = useRef<HTMLElement>(null);
  const tableOptions = useMemo(() => tableFilterOptions(dataModel), [dataModel]);

  const detailsQuery = useObjectDetailsQuery(
    objectType,
    objectId,
    hasSelection && selectedObject.nodeType === 'person',
  );
  // Live annotations/tags fetches stay in this panel for the selected node only.
  const annotationsQuery = useGetAnnotationsQuery(
    objectType,
    objectId,
    false,
    hasSelection && selectedObject.nodeType === 'person',
  );

  return (
    <aside
      ref={asideRef}
      className="border-grey-border bg-surface-card flex min-h-0 flex-col gap-md overflow-y-auto rounded-lg border p-md h-fit min-w-md"
    >
      <div className="flex flex-col gap-sm">
        <GraphMultiFilterSelect
          options={tableOptions}
          value={selectedTableNames}
          onToggle={toggleTableName}
          placeholder={t('graph:filter.tables.placeholder')}
        />
        {relationGroups.length > 0 ? (
          <GraphMultiFilterSelect
            options={relationGroups}
            value={selectedRelationGroupIds}
            onToggle={toggleRelationGroup}
            placeholder={t('graph:filter.relations.placeholder')}
          />
        ) : null}
        {isFilterDirty ? (
          <Button
            variant="secondary"
            appearance="stroked"
            size="small"
            disabled={isGeneratingGraph}
            onClick={refreshGraph}
          >
            <Icon icon="restart-alt" className={cn('size-4', isGeneratingGraph && 'animate-spin')} />
            {t('graph:filter.refresh')}
          </Button>
        ) : null}
      </div>

      <LayoutModeControl />

      {graphStats.hiddenCount > 0 ? (
        <Button variant="secondary" appearance="stroked" size="small" onClick={restoreHiddenNodes}>
          <Icon icon="eye" className="size-4" />
          {t('graph:panel.show_hidden_nodes', { count: graphStats.hiddenCount })}
        </Button>
      ) : null}

      <div className="border-grey-border bg-grey-background-light flex flex-col gap-sm rounded-md border p-md">
        {selectedObject ? (
          match(selectedObject)
            .with({ nodeType: 'person' }, (person) => (
              <>
                <div className="flex flex-wrap items-center gap-sm">
                  <span className="text-purple-primary text-sm font-semibold">
                    {resolveTitle(person.label, person.objectId)}
                  </span>
                  <ObjectRiskBadge {...person} />
                </div>
                {match(detailsQuery)
                  .with({ isError: true }, () => <QueryError onRetry={() => detailsQuery.refetch()} />)
                  .with({ isPending: true }, () => <DetailCardSkeleton />)
                  .with({ isSuccess: true }, ({ data: objectDetails }) => (
                    <>
                      <ClientObjectTagList
                        tableName={objectType}
                        objectId={objectId}
                        onTagIdsChange={(tagIds) => setNodeTagIds(nodeKey(objectType, objectId), tagIds)}
                      />

                      <DataFields
                        table={objectType}
                        object={objectDetails}
                        options={{ hideLinks: true, maxVisibleFields: 6, displayExpandButton: true }}
                      />
                    </>
                  ))
                  .exhaustive()}
                <ClientComments
                  objectType={objectType}
                  objectId={objectId}
                  annotationsQuery={annotationsQuery}
                  root={asideRef}
                />
                <PersonListDetail
                  header={<div className="text-sm font-semibold">{t('graph:panel.connected_nodes')}</div>}
                  persons={person.persons}
                  showTags={showTags}
                />
              </>
            ))
            .with({ nodeType: 'pivot' }, (pivot) => (
              <PersonListDetail
                header={
                  <div className="min-w-0">
                    <div className="text-grey-secondary text-xs leading-none">{pivot.objectType}</div>
                    <div className="text-orange-primary truncate text-sm font-semibold">{pivot.objectId}</div>
                  </div>
                }
                persons={pivot.persons}
                showTags={showTags}
              />
            ))
            .with({ nodeType: 'cluster' }, (cluster) => (
              <PersonListDetail
                header={
                  <div className="min-w-0">
                    <div className="text-grey-secondary text-xs leading-none">{t('graph:panel.grouped_branch')}</div>
                    <div className="truncate text-sm flex gap-xs items-center">
                      <span className="text-grey-primary font-semibold">
                        {t('graph:count.nodes', { count: cluster.nodeCount })}
                      </span>
                      <Icon icon="dot" className="size-3 text-grey-secondary" />
                      <span className="text-grey-secondary">
                        {t('graph:count.edges', { count: cluster.internalEdgeCount })}
                      </span>
                    </div>
                  </div>
                }
                persons={cluster.persons}
                showTags={showTags}
              />
            ))
            .with({ nodeType: 'hypernode' }, (hypernode) => (
              <div className="flex flex-col gap-xs">
                <div className="text-grey-secondary text-xs leading-none">{t('graph:panel.hypernode')}</div>
                <div className="text-grey-primary text-sm font-semibold">
                  {t('graph:panel.records_count_approx', { count: hypernode.hypernodeCount })}
                </div>
              </div>
            ))
            .exhaustive()
        ) : (
          <p className="text-grey-secondary text-xs">{t('graph:panel.select_node')}</p>
        )}
      </div>

      <div className="flex flex-col gap-sm">
        <div className="flex items-center justify-between gap-sm">
          <label htmlFor="show-risk-score" className="text-grey-primary cursor-pointer text-sm">
            {t('graph:panel.show_risk_score')}
          </label>
          <Switch id="show-risk-score" checked={showRiskScore} onCheckedChange={setShowRiskScore} />
        </div>
        <div className="flex items-center justify-between gap-sm">
          <label htmlFor="show-tags" className="text-grey-primary cursor-pointer text-sm">
            {t('graph:panel.show_tags')}
          </label>
          <Switch id="show-tags" checked={showTags} onCheckedChange={setShowTags} />
        </div>
        <div className="flex items-center justify-between gap-sm">
          <label htmlFor="hide-hyper-connected-nodes" className="text-grey-primary cursor-pointer text-sm">
            {t('graph:panel.show_hyper_connected_nodes')}
          </label>
          <Switch id="hide-hyper-connected-nodes" checked={showHypernodes} onCheckedChange={setShowHypernodes} />
        </div>
        <ClusterThresholdControl />
      </div>
    </aside>
  );
}
