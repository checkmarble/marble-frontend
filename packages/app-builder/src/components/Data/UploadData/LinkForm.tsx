import { getDataTypeIcon } from '@app-builder/models';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Input, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { UploadDataDrawerContext } from './Drawer';
import type { LinkRelationType } from './uploadData-types';
import { linkRelationTypes } from './uploadData-types';

export function LinkForm({ tableId, compact }: { tableId: string; compact?: boolean }) {
  const { getLinksForTable, addLink } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);

  const links = getLinksForTable(tableId);

  return (
    <section className="flex flex-col gap-v2-md">
      <h4 className="text-m font-semibold">{t('data:upload_data.links_settings')}</h4>
      <div className="flex flex-col gap-v2-md">
        {links.map((link) => (
          <LinkRow key={link.linkId} linkId={link.linkId} tableId={tableId} compact={compact} />
        ))}
      </div>
      <div>
        <Button variant="primary" appearance="stroked" onClick={() => addLink(tableId)}>
          <Icon icon="plus" className="size-4" />
          {t('data:upload_data.link_add')}
        </Button>
      </div>
    </section>
  );
}

function LinkRow({ linkId, tableId, compact }: { linkId: string; tableId: string; compact?: boolean }) {
  const { linksState, updateLinkState, removeLink, tablesState } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);

  const link = linksState[linkId]!;
  const currentTable = tablesState[tableId]!;

  const fieldOptions = useMemo(
    () =>
      currentTable.fields.map((field) => ({
        label: (
          <span className="flex items-center gap-v2-sm">
            <Icon icon={getDataTypeIcon(field.dataType) ?? 'minus'} className="size-4" />
            <span>{field.alias ?? field.name}</span>
          </span>
        ),
        value: field.id,
      })),
    [currentTable.fields, currentTable.alias],
  );

  const relationOptions = useMemo(
    () =>
      linkRelationTypes.map((rel) => ({
        label: (
          <span className="flex items-center gap-v2-sm">
            <Icon
              icon={rel === 'belongs_to' ? 'arrow-forward' : 'arrow-range'}
              className="size-4 text-purple-primary"
            />
            <span>{t(`data:upload_data.link_relation_${rel}`)}</span>
          </span>
        ),
        value: rel,
      })),
    [t],
  );

  const destinationOptions = useMemo(
    () =>
      Object.values(tablesState)
        .filter((table) => table.tableId !== tableId && !table.isCanceled)
        .map((table) => ({
          label: (
            <span className="flex items-center gap-v2-sm">
              <span>{table.alias || table.name}</span>
              {table.ftmEntity !== 'other' ? (
                <span className="text-xs text-grey-secondary bg-grey-border rounded-sm px-1">
                  {t(`data:upload_data.ftm_entity.${table.ftmEntity}`)}
                </span>
              ) : null}
            </span>
          ),
          value: table.tableId,
        })),
    [tablesState, tableId, t],
  );

  return (
    <div className={cn('flex gap-x-v2-md gap-y-v2-sm', compact ? 'flex-wrap items-start' : 'items-center')}>
      <Input
        value={link.name}
        onChange={(e) => updateLinkState(linkId, { name: e.currentTarget.value })}
        placeholder={t('data:upload_data.link_name_placeholder')}
        className="w-36 min-w-fit"
      />
      <SelectV2
        value={link.tableFieldId}
        placeholder={t('data:upload_data.link_field_placeholder')}
        onChange={(value) => updateLinkState(linkId, { tableFieldId: value })}
        options={fieldOptions}
        className="flex-1 min-w-fit"
      />
      <SelectV2
        value={link.relationType}
        placeholder=""
        onChange={(value) => updateLinkState(linkId, { relationType: value as LinkRelationType })}
        options={relationOptions}
        className="w-40 min-w-fit "
      />
      <SelectV2
        value={link.targetTableId}
        placeholder={t('data:upload_data.link_destination_placeholder')}
        onChange={(value) => updateLinkState(linkId, { targetTableId: value })}
        options={destinationOptions}
        className="flex-1 min-w-fit"
      />
      <button
        type="button"
        onClick={() => removeLink(linkId)}
        className="shrink-0 rounded-lg p-2 text-grey-secondary hover:bg-grey-border hover:text-red-primary"
      >
        <Icon icon="delete" className="size-4" />
      </button>
    </div>
  );
}
