import { Callout } from '@app-builder/components/Callout';
import { LinksEditorContext } from '@app-builder/components/Data/shared/LinksEditorContext';
import { linkRelationTypes } from '@app-builder/models';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Input, SelectV2, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DatatypeIcon } from './DatatypeOption';

export function LinkForm({
  compact,
  errorLinkIds,
  hasError,
}: {
  compact?: boolean;
  errorLinkIds?: ReadonlySet<string>;
  hasError?: boolean;
}) {
  const { links, sourceTableName, addLink, destinationTableOptions } = LinksEditorContext.useValue();
  const { t } = useTranslation(['data']);
  const { isCreateDataModelLinkAvailable } = useDataModelFeatureAccess();

  const tableLabel = sourceTableName.trim() || t('data:upload_data.table_name_fallback');

  // A table can hold several belongs_to links to different parent tables, but a given
  // record may only belong to one of them. Warn about the arbitrary tie-break when more
  // than one is configured, listing the fields the owner is looked up from.
  const belongsToLinks = links.filter((link) => link.relationType === 'belongs_to');
  const belongsToFieldNames = belongsToLinks.map((link) => link.tableFieldId).filter(Boolean);

  return (
    <section className={cn('flex flex-col gap-md rounded-lg', hasError && 'bg-red-primary/5 p-sm')}>
      <div className="flex flex-col gap-xs">
        <Typo variant="subtitle2">{t('data:upload_data.links_title')}</Typo>
        <p className="text-s text-grey-secondary">
          {t('data:upload_data.links_description', { tableName: tableLabel })}
        </p>
      </div>
      {belongsToLinks.length > 1 ? (
        <Callout color="orange" icon="warning" iconColor="orange">
          <span>
            {t('data:upload_data.multiple_belongs_to_warning', { tableName: tableLabel })}
            {belongsToFieldNames.length > 0
              ? ` ${t('data:upload_data.multiple_belongs_to_warning_fields', {
                  fields: belongsToFieldNames.join(', '),
                })}`
              : null}
          </span>
        </Callout>
      ) : null}
      <div className="flex flex-col gap-md">
        {links.map((link) => (
          <LinkRow key={link.linkId} linkId={link.linkId} compact={compact} hasError={errorLinkIds?.has(link.linkId)} />
        ))}
      </div>
      {isCreateDataModelLinkAvailable && (
        <div className="flex items-center gap-sm">
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
        .filter((field) => field.dataType === 'String' && field.name !== 'object_id')
        .map((field) => ({
          label: (
            <span className="flex items-center gap-sm" title={field.alias !== field.name ? field.name : undefined}>
              <DatatypeIcon dataType={field.dataType} />
              <span>{field.alias || field.name}</span>
            </span>
          ),
          value: field.name,
        })),
    [sourceTableFields],
  );

  // A table may have several belongs_to links (polymorphic belongs_to: at most one
  // applies per row)
  const relationOptions = useMemo(
    () =>
      linkRelationTypes.map((rel) => ({
        label: (
          <span className="flex items-center gap-sm">
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
      destinationTableOptions.map((t) => ({
        label: <span>{t.label}</span>,
        value: t.tableId,
      })),
    [destinationTableOptions],
  );

  return (
    <div
      className={cn(
        'flex gap-x-md gap-y-sm rounded-lg',
        compact ? 'flex-wrap items-start' : 'items-center',
        hasError && 'border border-red-primary/40 bg-red-primary/5 p-sm',
      )}
    >
      <Input
        value={link.name}
        onChange={(e) => updateLink(linkId, { name: e.currentTarget.value })}
        placeholder={t('data:upload_data.link_name_placeholder')}
        className="w-36 min-w-fit"
        disabled={link.isNew === false}
      />
      <SelectV2
        value={link.tableFieldId}
        placeholder={t('data:upload_data.link_field_placeholder')}
        onChange={(value) => updateLink(linkId, { tableFieldId: value })}
        options={fieldOptions}
        className="flex-1 min-w-fit"
        disabled={link.isNew === false}
      />
      <SelectV2
        value={link.relationType}
        placeholder=""
        onChange={(value) => updateLink(linkId, { relationType: value })}
        options={relationOptions}
        className="w-40 min-w-fit"
      />
      <SelectV2
        value={link.targetTableId}
        placeholder={t('data:upload_data.link_destination_placeholder')}
        onChange={(value) => updateLink(linkId, { targetTableId: value })}
        options={destinationOptions}
        className="flex-1 min-w-fit"
        disabled={link.isNew === false}
      />
      {isDeleteDataModelLinkAvailable && (
        <button
          type="button"
          onClick={() => removeLink(linkId)}
          className="shrink-0 rounded-lg p-sm text-grey-secondary hover:bg-grey-border hover:text-red-primary"
          title={t('data:upload_data.link_delete')}
        >
          <Icon icon="delete" className="size-4" />
        </button>
      )}
    </div>
  );
}
