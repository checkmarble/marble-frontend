import { type DataModel, type DataModelObjectValue } from '@app-builder/models';
import { type CaseClient, type CaseObjectReference, CaseStatus } from '@app-builder/models/cases';
import { isMaxRiskLevelInRange } from '@app-builder/models/scoring';
import { useAddObjectsToCaseMutation } from '@app-builder/queries/cases/add-objects-to-case';
import { useRemoveObjectsFromCaseMutation } from '@app-builder/queries/cases/remove-objects-from-case';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useScoreLatestQuery } from '@app-builder/queries/scoring/get-score-latest';
import { useGetScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import { useDataModel } from '@app-builder/services/data/data-model';
import { isAccessible } from '@app-builder/services/feature-access';
import { useDebouncedCallbackRef } from '@marble/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { type ReactNode, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Card, cn, Input, MenuCommand, Panel, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { subEntityIcon } from '../Graph/GraphComponents';
import { createGraphTypeHelpers } from '../Graph/lib/data-model-map';
import { RiskLevelBadge } from '../UserScoring/RiskLevelBadge';

type ManageClientsPanelProps = {
  clients: CaseClient[];
  caseId: string;
  caseStatus: CaseStatus;
  userScoringAccess: FeatureAccessLevelDto;
  children: ReactNode;
};

/** Slide-out that lists a case's clients and lets you add or remove them. */
export function ManageClientsPanel({
  clients,
  caseId,
  caseStatus,
  userScoringAccess,
  children,
}: ManageClientsPanelProps) {
  const { t } = useTranslation(['cases', 'common']);
  const router = useRouter();
  const queryClient = useQueryClient();
  const addObjectsToCase = useAddObjectsToCaseMutation();
  const removeObjectsFromCase = useRemoveObjectsFromCaseMutation();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addedObjects, setAddedObjects] = useState<AddedObject[]>([]);
  const [deletedObjects, setDeletedObjects] = useState<CaseObjectReference[]>([]);

  const isNotClosed = caseStatus !== 'closed';
  const showRiskLevel = isAccessible(userScoringAccess);
  const deletedObjectKeys = new Set(deletedObjects.map((object) => objectKey(object.objectType, object.objectId)));
  const hasPendingChanges = addedObjects.length > 0 || deletedObjects.length > 0;

  const knownObjectKeys = new Set([
    ...clients.flatMap((client) =>
      client.objectId && !deletedObjectKeys.has(objectKey(client.tableName, client.objectId))
        ? [objectKey(client.tableName, client.objectId)]
        : [],
    ),
    ...addedObjects.map((object) => objectKey(object.tableName, object.objectId)),
  ]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSaving) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setAddedObjects([]);
      setDeletedObjects([]);
    }
  };

  const handleSaveChanges = async () => {
    const pendingAdds = addedObjects.map(toCaseObjectReference);
    const pendingRemoves = deletedObjects;
    if (pendingAdds.length === 0 && pendingRemoves.length === 0) return;

    setIsSaving(true);
    const pendingAddKeys = new Set(pendingAdds.map((object) => objectKey(object.objectType, object.objectId)));
    const pendingRemoveKeys = new Set(pendingRemoves.map((object) => objectKey(object.objectType, object.objectId)));
    let didChange = false;
    try {
      if (pendingAdds.length > 0) {
        await addObjectsToCase.mutateAsync({ newCase: false, caseId, objects: pendingAdds });
        setAddedObjects((prev) =>
          prev.filter((object) => !pendingAddKeys.has(objectKey(object.tableName, object.objectId))),
        );
        didChange = true;
      }
      if (pendingRemoves.length > 0) {
        await removeObjectsFromCase.mutateAsync({ caseId, objects: pendingRemoves });
        setDeletedObjects((prev) =>
          prev.filter((object) => !pendingRemoveKeys.has(objectKey(object.objectType, object.objectId))),
        );
        didChange = true;
      }
      setOpen(false);
    } catch {
      toast.error(t('common:global_error'));
    } finally {
      if (didChange) {
        await Promise.all([
          router.invalidate(),
          ...[...pendingAdds, ...pendingRemoves].map((object) =>
            queryClient.invalidateQueries({ queryKey: ['data', object.objectType, object.objectId, 'cases'] }),
          ),
        ]);
      }
      setIsSaving(false);
    }
  };

  const handleDelete = (tableName: string, objectId: string) => {
    const key = objectKey(tableName, objectId);
    setDeletedObjects((prev) =>
      prev.some((object) => objectKey(object.objectType, object.objectId) === key)
        ? prev
        : [...prev, { objectType: tableName, objectId }],
    );
  };

  const handleRestore = (tableName: string, objectId: string) => {
    const key = objectKey(tableName, objectId);
    setDeletedObjects((prev) => prev.filter((object) => objectKey(object.objectType, object.objectId) !== key));
  };

  const handleAdd = (object: AddedObject) => {
    const key = objectKey(object.tableName, object.objectId);
    // Re-adding a client queued for removal cancels that removal. The case still has it until save.
    if (deletedObjectKeys.has(key)) {
      handleRestore(object.tableName, object.objectId);
      return;
    }
    setAddedObjects((prev) => [...prev, object]);
  };

  const handleRemoveAdded = (object: AddedObject) => {
    setAddedObjects((prev) =>
      prev.filter((o) => objectKey(o.tableName, o.objectId) !== objectKey(object.tableName, object.objectId)),
    );
  };

  return (
    <Panel.Root open={open} onOpenChange={handleOpenChange}>
      <Panel.Trigger asChild>{children}</Panel.Trigger>
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
                kind="new"
              />
            ))}
            {clients.map((client) => (
              <ClientObjectItem
                key={client.key}
                client={client}
                canDelete={isNotClosed}
                isPendingRemoval={
                  !!client.objectId && deletedObjectKeys.has(objectKey(client.tableName, client.objectId))
                }
                showRiskLevel={showRiskLevel}
                onDelete={handleDelete}
                onRestore={handleRestore}
              />
            ))}
          </div>
          <Panel.Footer>
            <Panel.FooterButton isCloseButton label={t('common:close')} />
            <Panel.FooterButton
              label={t('cases:manage_clients_panel.save_changes')}
              onClick={handleSaveChanges}
              disabled={!hasPendingChanges}
              isLoading={isSaving}
            />
          </Panel.Footer>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

type AddedObject = {
  tableName: string;
  objectId: string;
  data: Record<string, DataModelObjectValue>;
};

const objectKey = (tableName: string, objectId: string) => `${tableName}:${objectId}`;

const toCaseObjectReference = (object: AddedObject): CaseObjectReference => ({
  objectType: object.tableName,
  objectId: object.objectId,
});

function ClientObjectItem({
  client,
  canDelete,
  isPendingRemoval,
  showRiskLevel,
  onDelete,
  onRestore,
}: {
  client: CaseClient;
  canDelete: boolean;
  isPendingRemoval: boolean;
  showRiskLevel: boolean;
  onDelete: (tableName: string, objectId: string) => void;
  onRestore: (tableName: string, objectId: string) => void;
}) {
  const objectId = client.objectId;
  const canChangeMembership = canDelete && !!objectId && client.kind !== 'pivot';

  return (
    <ObjectItem
      tableName={client.tableName}
      objectId={objectId ?? client.key}
      data={client.object.data}
      showRiskLevel={showRiskLevel && client.isIngested}
      kind={isPendingRemoval ? 'deleted' : client.kind}
      action={
        canChangeMembership ? (
          isPendingRemoval ? (
            <Button variant="secondary" appearance="link" onClick={() => onRestore(client.tableName, objectId)}>
              <Icon icon="plus" className="size-4" />
            </Button>
          ) : (
            <Button variant="secondary" appearance="link" onClick={() => onDelete(client.tableName, objectId)}>
              <Icon icon="delete" className="size-4" />
            </Button>
          )
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
  kind,
  action,
}: {
  tableName: string;
  objectId: string;
  data: Record<string, DataModelObjectValue>;
  showRiskLevel: boolean;
  kind: 'pivot' | 'entity' | 'new' | 'deleted';
  action?: ReactNode;
}) {
  const dataModel = useDataModel();
  const typeHelpers = createGraphTypeHelpers(dataModel);
  const { t } = useTranslation('cases');

  return (
    <Card className={cn('p-md flex items-center gap-sm justify-between', kind === 'deleted' && 'opacity-60')}>
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
        {kind === 'entity' && (
          <Tag color="grey" size="xs">
            {t('cases:case_manager.added_entity')}
          </Tag>
        )}
        {kind === 'new' && (
          <Tag color="purple" size="xs">
            {t('cases:case_manager.new_entity')}
          </Tag>
        )}
        {kind === 'deleted' && (
          <Tag color="red" size="xs">
            {t('cases:case_manager.removed_entity')}
          </Tag>
        )}
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
                <Button variant="secondary" mode="icon" onClick={handleAdd}>
                  <Icon icon="plus" className="size-4" />
                </Button>
              )
            }
            kind="entity"
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
