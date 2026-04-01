import { LinksEditorContext } from '@app-builder/components/Data/shared/LinksEditorContext';
import { getDataTypeIcon, linkRelationTypes } from '@app-builder/models';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Input, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function LinkForm({
  compact,
  errorLinkIds,
  hasError,
}: {
  compact?: boolean;
  errorLinkIds?: ReadonlySet<string>;
  hasError?: boolean;
}) {
  const { links, addLink, destinationTableOptions } = LinksEditorContext.useValue();
  const { t } = useTranslation(['data']);
  const { isCreateDataModelLinkAvailable } = useDataModelFeatureAccess();
  return (
    <section className={cn('flex flex-col gap-v2-md rounded-lg', hasError && 'border border-red-primary p-v2-md')}>
      <h4 className="text-m font-semibold">{t('data:upload_data.links_settings')}</h4>
      <div className="flex flex-col gap-v2-md">
        {links.map((link) => (
          <LinkRow key={link.linkId} linkId={link.linkId} compact={compact} hasError={errorLinkIds?.has(link.linkId)} />
        ))}
      </div>
      {isCreateDataModelLinkAvailable && (
        <div className="flex items-center gap-v2-sm">
          <Button
            variant="primary"
            appearance="stroked"
            onClick={() => addLink()}
            disabled={!destinationTableOptions.length}
          >
            <Icon icon="plus" className="size-4" />
            {t('data:upload_data.link_add')}
          </Button>
          {!destinationTableOptions.length && (
            <span className="text-grey-secondary">{t('data:create_table.link_destination_table_required')}</span>
          )}
        </div>
      )}
    </section>
  );
}

function LinkRow({ linkId, compact, hasError }: { linkId: string; compact?: boolean; hasError?: boolean }) {
  const { links, sourceTableFields, destinationTableOptions, updateLink, removeLink } = LinksEditorContext.useValue();
  const { t } = useTranslation(['data']);
  const { isDeleteDataModelLinkAvailable } = useDataModelFeatureAccess();

  const link = links.find((l) => l.linkId === linkId)!;

  const fieldOptions = useMemo(
    () =>
      sourceTableFields
        .filter((field) => field.dataType === 'String')
        .map((field) => ({
          label: (
            <span className="flex items-center gap-v2-sm">
              <Icon icon={getDataTypeIcon(field.dataType) ?? 'minus'} className="size-4" />
              <span>{field.alias || field.name}</span>
            </span>
          ),
          value: field.id,
        })),
    [sourceTableFields],
  );

  const belongsToAlreadyUsed = useMemo(
    () => links.some((l) => l.linkId !== linkId && l.relationType === 'belongs_to'),
    [links, linkId],
  );

  const relationOptions = useMemo(
    () =>
      linkRelationTypes
        .filter((rel) => rel !== 'belongs_to' || !belongsToAlreadyUsed)
        .map((rel) => ({
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
    [t, belongsToAlreadyUsed],
  );

  const destinationOptions = useMemo(
    () =>
      destinationTableOptions.map((t) => ({
        label: <span>{t.label}</span>,
        value: t.tableId,
      })),
    [destinationTableOptions],
  );

  return (
    <div
      className={cn(
        'flex gap-x-v2-md gap-y-v2-sm rounded-lg',
        compact ? 'flex-wrap items-start' : 'items-center',
        hasError && 'border border-red-primary p-v2-sm',
      )}
    >
      <Input
        value={link.name}
        onChange={(e) => updateLink(linkId, { name: e.currentTarget.value })}
        placeholder={t('data:upload_data.link_name_placeholder')}
        borderColor={hasError ? 'redfigma-47' : undefined}
        className="w-36 min-w-fit"
      />
      <SelectV2
        value={link.tableFieldId}
        placeholder={t('data:upload_data.link_field_placeholder')}
        onChange={(value) => updateLink(linkId, { tableFieldId: value })}
        options={fieldOptions}
        className={cn('flex-1 min-w-fit', hasError && 'border-red-primary')}
      />
      <SelectV2
        value={link.relationType}
        placeholder=""
        onChange={(value) => updateLink(linkId, { relationType: value })}
        options={relationOptions}
        className={cn('w-40 min-w-fit', hasError && 'border-red-primary')}
      />
      <SelectV2
        value={link.targetTableId}
        placeholder={t('data:upload_data.link_destination_placeholder')}
        onChange={(value) => updateLink(linkId, { targetTableId: value })}
        options={destinationOptions}
        className={cn('flex-1 min-w-fit', hasError && 'border-red-primary')}
      />
      {isDeleteDataModelLinkAvailable && (
        <button
          type="button"
          onClick={() => removeLink(linkId)}
          className="shrink-0 rounded-lg p-2 text-grey-secondary hover:bg-grey-border hover:text-red-primary"
        >
          <Icon icon="delete" className="size-4" />
        </button>
      )}
    </div>
  );
}
