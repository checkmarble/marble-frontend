import { type DataModel, type DataModelObjectValue } from '@app-builder/models';
import { CaseStatus, getPivotObjectKey, type PivotObject } from '@app-builder/models/cases';
import { isMaxRiskLevelInRange } from '@app-builder/models/scoring';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useScoreLatestQuery } from '@app-builder/queries/scoring/get-score-latest';
import { useGetScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import { useDataModel } from '@app-builder/services/data/data-model';
import { isAccessible } from '@app-builder/services/feature-access';
import { useDebouncedCallbackRef } from '@marble/shared';
import { Link } from '@tanstack/react-router';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input, MenuCommand, Panel, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { subEntityIcon } from '../Graph/GraphComponents';
import { createGraphTypeHelpers } from '../Graph/lib/data-model-map';
import { RiskLevelBadge } from '../UserScoring/RiskLevelBadge';

type PivotTabsProps = {
  /** Pivots to render a tab for. Nothing renders when there is only one. */
  pivots: PivotObject[];
  /**
   * Pivot list the tab numbers come from. Pass the case's full list when `pivots`
   * is a subset, so a client and its links tab carry the same number.
   */
  numberedFrom?: PivotObject[];
  to: './clients/$pivotValue' | './links/$pivotValue';
  caseStatus: CaseStatus;
  userScoringAccess: FeatureAccessLevelDto;
};

/** The "Client 1 / Client 2" strip above a pivot-scoped case tab. */
export function PivotTabs({ pivots, numberedFrom = pivots, to, caseStatus, userScoringAccess }: PivotTabsProps) {
  const { t } = useTranslation(['cases', 'common']);
  const [openAddClientPanel, setOpenAddClientPanel] = useState(false);
  const [addedObjects, setAddedObjects] = useState<AddedObject[]>([]);

  if (pivots.length <= 1) return null;

  const orderedKeys = numberedFrom.map(getPivotObjectKey);
  const isNotClosed = caseStatus !== 'closed';
  const showRiskLevel = isAccessible(userScoringAccess);

  const knownObjectKeys = new Set([
    ...pivots.flatMap((pivot) => (pivot.pivotObjectId ? [objectKey(pivot.pivotObjectName, pivot.pivotObjectId)] : [])),
    ...addedObjects.map((object) => objectKey(object.tableName, object.objectId)),
  ]);

  const handleOpenChange = (open: boolean) => {
    setOpenAddClientPanel(open);
    if (!open) setAddedObjects([]);
  };

  const handleSaveChanges = () => {
    handleOpenChange(false);
  };

  const handleDelete = (name: string, id: string) => {
    console.log('delete', { name, id });
  };

  const handleAdd = (object: AddedObject) => {
    setAddedObjects((prev) => [...prev, object]);
  };

  const handleRemoveAdded = (object: AddedObject) => {
    setAddedObjects((prev) =>
      prev.filter((o) => objectKey(o.tableName, o.objectId) !== objectKey(object.tableName, object.objectId)),
    );
  };

  return (
    <div className="mb-lg flex shrink-0 gap-sm items-center">
      {pivots.map((pivot) => {
        const pivotValue = getPivotObjectKey(pivot);
        return (
          <Link
            key={pivotValue}
            className="px-sm h-8 rounded-md border border-grey-border flex items-center aria-[current=page]:border-purple-primary"
            from="/cases/s/$caseId/"
            to={to}
            params={{ pivotValue }}
          >
            {t('cases:case_manager.client_panel.label', { index: orderedKeys.indexOf(pivotValue) + 1 })}
          </Link>
        );
      })}
      <Panel.Root open={openAddClientPanel} onOpenChange={handleOpenChange}>
        <Panel.Trigger asChild>
          <Button variant="secondary" appearance="link">
            <Icon icon="plus" className="size-4" />
            <span>{t('cases:manage_clients')}</span>
          </Button>
        </Panel.Trigger>

        <Panel.Container size="small">
          <Panel.Content>
            <Panel.Header>{t('cases:manage_clients_panel.title')}</Panel.Header>
            <div className="flex flex-col gap-sm">
              {isNotClosed && (
                <AddClientToCase knownObjectKeys={knownObjectKeys} showRiskLevel={showRiskLevel} onAdd={handleAdd} />
              )}
              {addedObjects.map((object) => (
                <ObjectItem
                  key={objectKey(object.tableName, object.objectId)}
                  tableName={object.tableName}
                  objectId={object.objectId}
                  data={object.data}
                  showRiskLevel={showRiskLevel}
                  action={
                    <Button variant="secondary" appearance="link" onClick={() => handleRemoveAdded(object)}>
                      <Icon icon="delete" className="size-4" />
                    </Button>
                  }
                />
              ))}
              {pivots.map((pivot) => (
                <PivotObjectItem
                  key={pivot.pivotObjectId}
                  pivot={pivot}
                  canDelete={isNotClosed}
                  showRiskLevel={showRiskLevel}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            <Panel.Footer>
              <Panel.FooterButton isCloseButton label={t('common:close')} />
              <Panel.FooterButton
                label={t('cases:manage_clients_panel.save_changes')}
                color="primary"
                onClick={handleSaveChanges}
              />
            </Panel.Footer>
          </Panel.Content>
        </Panel.Container>
      </Panel.Root>
    </div>
  );
}

type AddedObject = {
  tableName: string;
  objectId: string;
  data: Record<string, DataModelObjectValue>;
};

const objectKey = (tableName: string, objectId: string) => `${tableName}:${objectId}`;

function PivotObjectItem({
  pivot,
  canDelete,
  showRiskLevel,
  onDelete,
}: {
  pivot: PivotObject;
  canDelete: boolean;
  showRiskLevel: boolean;
  onDelete: (name: string, id: string) => void;
}) {
  return (
    <ObjectItem
      tableName={pivot.pivotObjectName}
      objectId={pivot.pivotObjectId ?? pivot.pivotObjectData.data.object_id}
      data={pivot.pivotObjectData.data}
      showRiskLevel={showRiskLevel && pivot.isIngested}
      action={
        canDelete && pivot.pivotObjectId ? (
          <Button
            variant="secondary"
            appearance="link"
            onClick={() => onDelete(pivot.pivotObjectName, pivot.pivotObjectId!)}
          >
            <Icon icon="delete" className="size-4" />
          </Button>
        ) : null
      }
    />
  );
}

function ObjectItem({
  tableName,
  objectId,
  data,
  showRiskLevel,
  action,
}: {
  tableName: string;
  objectId: string;
  data: Record<string, DataModelObjectValue>;
  showRiskLevel: boolean;
  action?: ReactNode;
}) {
  const dataModel = useDataModel();
  const typeHelpers = createGraphTypeHelpers(dataModel);

  return (
    <Card className="p-md flex items-center gap-sm justify-between">
      <div className="flex items-center gap-sm">
        <Icon
          icon={subEntityIcon({
            semanticType: typeHelpers.getSemanticType(tableName),
            subEntity: typeHelpers.getPersonSubEntity(tableName),
          })}
          className="size-4 shrink-0 text-purple-primary"
        />
        {getObjectName(dataModel, tableName, data, objectId)}
        <Tag color="white" size="small" appearance="monospace">
          {objectId}
        </Tag>
        {showRiskLevel ? <ObjectRiskLevel objectType={tableName} objectId={objectId} /> : null}
      </div>
      {action}
    </Card>
  );
}

function ObjectRiskLevel({ objectType, objectId }: { objectType: string; objectId: string }) {
  const settingsQuery = useGetScoringSettingsQuery();
  const scoreQuery = useScoreLatestQuery(objectType, objectId);

  const maxRiskLevel = settingsQuery.data?.settings?.maxRiskLevel;
  const riskLevel = scoreQuery.data?.score?.risk_level;
  if (maxRiskLevel == null || riskLevel == null || !isMaxRiskLevelInRange(maxRiskLevel)) return null;

  return <RiskLevelBadge riskLevel={riskLevel} maxRiskLevel={maxRiskLevel} />;
}

export function getObjectName(
  dataModel: DataModel,
  tableName: string,
  data: Record<string, DataModelObjectValue>,
  fallbackId: string,
) {
  const table = dataModel.find((t) => t.name === tableName);
  const nameField = table?.fields.find((field) => field.semanticType === 'name');
  const value = nameField ? data[nameField.name] : undefined;
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number') return String(value);
  return fallbackId;
}

const OBJECT_ID_SEARCH_DEBOUNCE_MS = 500;

function AddClientToCase({
  knownObjectKeys,
  showRiskLevel,
  onAdd,
}: {
  /** Objects already on the case or pending addition, keyed with `objectKey`. */
  knownObjectKeys: Set<string>;
  showRiskLevel: boolean;
  onAdd: (object: AddedObject) => void;
}) {
  const { t } = useTranslation(['cases', 'data']);
  const [objectIdInput, setObjectIdInput] = useState('');
  const [searchedObjectId, setSearchedObjectId] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const dataModel = useDataModel();

  const personTables = useMemo(() => dataModel.filter((t) => t.semanticType === 'person'), [dataModel]);
  const tableName = selectedTable ?? (personTables.length === 1 ? personTables[0]?.name : undefined);

  const searchObjectId = useDebouncedCallbackRef(
    (value: string) => setSearchedObjectId(value.trim()),
    OBJECT_ID_SEARCH_DEBOUNCE_MS,
  );
  const objectQuery = useObjectDetailsQuery(tableName, searchedObjectId);

  const isSearchUpToDate = searchedObjectId === objectIdInput.trim();
  const foundObject = isSearchUpToDate ? objectQuery.data : undefined;
  const isAlreadyAdded = !!tableName && knownObjectKeys.has(objectKey(tableName, searchedObjectId));

  const handleInputChange = (value: string) => {
    setObjectIdInput(value);
    searchObjectId(value);
  };

  const handleAdd = () => {
    if (!tableName || !foundObject || isAlreadyAdded) return;
    onAdd({ tableName, objectId: searchedObjectId, data: foundObject.data });
    setObjectIdInput('');
    setSearchedObjectId('');
  };

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center gap-sm">
        <MenuCommand.Menu open={tableMenuOpen} onOpenChange={setTableMenuOpen}>
          <MenuCommand.Trigger>
            <MenuCommand.SelectButton className="shrink-0">
              {tableName ?? t('cases:manage_clients_panel.table_placeholder')}
            </MenuCommand.SelectButton>
          </MenuCommand.Trigger>
          <MenuCommand.Content align="start" sideOffset={4}>
            <MenuCommand.List>
              {personTables.map((table) => (
                <MenuCommand.Item
                  key={table.id}
                  value={table.name}
                  onSelect={() => {
                    setSelectedTable(table.name);
                    setTableMenuOpen(false);
                  }}
                >
                  {table.name}
                  {tableName === table.name ? <Icon icon="tick" className="size-5 text-purple-primary" /> : null}
                </MenuCommand.Item>
              ))}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
        <Input
          className="flex-1 min-w-0"
          value={objectIdInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onEnterKeyDown={handleAdd}
          startAdornment="search"
          placeholder={t('cases:manage_clients_panel.search_placeholder')}
          disabled={!tableName}
        />
      </div>
      {tableName && searchedObjectId ? (
        !isSearchUpToDate || objectQuery.isPending ? (
          <div className="flex justify-center p-sm">
            <Icon icon="spinner" className="size-5 animate-spin text-grey-secondary" />
          </div>
        ) : foundObject ? (
          <ObjectItem
            tableName={tableName}
            objectId={searchedObjectId}
            data={foundObject.data}
            showRiskLevel={showRiskLevel}
            action={
              isAlreadyAdded ? (
                <span className="text-s text-grey-secondary">{t('cases:manage_clients_panel.already_added')}</span>
              ) : (
                <Button variant="secondary" appearance="link" onClick={handleAdd}>
                  <Icon icon="plus" className="size-4" />
                </Button>
              )
            }
          />
        ) : (
          <p className="text-s text-grey-secondary text-center p-sm">
            {t('data:viewer.no_object_found', { tableName, objectId: searchedObjectId })}
          </p>
        )
      ) : null}
    </div>
  );
}
