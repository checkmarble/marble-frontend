import type { DataModel } from '@app-builder/models/data-model';
import type { TracfinMapping } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { MappingEditor } from './MappingEditor';
import { MappingRow } from './MappingRow';
import { groupMappingsByTargetBlock, listMappingTargetFields } from './mapping-targets';
import type { TracfinPathHop } from './path-hops';

type MappingsSectionProps = {
  mappings: TracfinMapping[];
  catalogIndex: TracfinCatalogIndex;
  dataModel: DataModel;
  /** Diagnostic codes by mapping id, from the last rejected save. */
  errors: Record<string, string[]>;
  onAdd: (targetField: string) => string;
  onDuplicate: (mappingId: string) => string;
  onRemove: (mappingId: string) => void;
  onChange: (mapping: TracfinMapping) => void;
  onChooseHop: (mappingId: string, index: number, hop: Pick<TracfinPathHop, 'link' | 'direction' | 'table'>) => void;
};

export function MappingsSection({
  mappings,
  catalogIndex,
  dataModel,
  errors,
  onAdd,
  onDuplicate,
  onRemove,
  onChange,
  onChooseHop,
}: MappingsSectionProps) {
  const { t } = useTranslation(['tracfin']);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const groups = groupMappingsByTargetBlock(mappings, catalogIndex);

  return (
    <section aria-labelledby="tracfin-mappings-title" className="flex flex-col gap-md">
      <div className="flex flex-wrap items-start justify-between gap-sm">
        <div className="flex flex-col gap-xs">
          <Typo as="h2" variant="title2" id="tracfin-mappings-title">
            {t('tracfin:settings.mappings.title')}
          </Typo>
          <p className="text-s text-grey-secondary">{t('tracfin:settings.mappings.description')}</p>
        </div>
        <AddMappingButton catalogIndex={catalogIndex} onAdd={(targetField) => setSelectedId(onAdd(targetField))} />
      </div>

      {mappings.length === 0 ? (
        <p className="text-s text-grey-secondary border-grey-border rounded-lg border border-dashed p-md text-center">
          {t('tracfin:settings.mappings.empty')}
        </p>
      ) : null}

      {groups.map((group) => (
        <section
          key={group.blockId ?? 'unknown'}
          aria-label={group.blockId ?? t('tracfin:settings.mappings.unknown_block')}
          className="flex flex-col gap-sm"
        >
          <h3 className="text-grey-secondary font-mono text-xs">
            {group.blockId ?? t('tracfin:settings.mappings.unknown_block')}
          </h3>
          {group.mappings.map((mapping) => {
            const selected = mapping.id === selectedId;
            return (
              <div key={mapping.id} className="flex flex-col gap-sm">
                <MappingRow
                  mapping={mapping}
                  catalogIndex={catalogIndex}
                  selected={selected}
                  errorCodes={errors[mapping.id] ?? []}
                  onSelect={() => setSelectedId(selected ? null : mapping.id)}
                  onDuplicate={() => setSelectedId(onDuplicate(mapping.id))}
                  onRemove={() => {
                    if (selected) setSelectedId(null);
                    onRemove(mapping.id);
                  }}
                />
                {selected ? (
                  <div className="border-grey-border bg-surface-card ms-md rounded-md border p-md">
                    <MappingEditor
                      mapping={mapping}
                      catalogIndex={catalogIndex}
                      dataModel={dataModel}
                      onChange={onChange}
                      onChooseHop={(index, hop) => onChooseHop(mapping.id, index, hop)}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      ))}
    </section>
  );
}

/** Picks the target field of a new mapping, which then opens in the editor. */
function AddMappingButton({
  catalogIndex,
  onAdd,
}: {
  catalogIndex: TracfinCatalogIndex;
  onAdd: (targetField: string) => void;
}) {
  const { t } = useTranslation(['tracfin']);
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <Button variant="primary">
          <Icon icon="plus" className="size-4" />
          {t('tracfin:settings.mappings.add')}
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="end" className="mt-xs w-[28rem] max-w-[90vw]">
        <MenuCommand.Combobox placeholder={t('tracfin:settings.mapping.search_target')} />
        <MenuCommand.List>
          <MenuCommand.Empty className="text-s text-grey-secondary p-sm text-center">
            {t('tracfin:settings.mapping.no_target')}
          </MenuCommand.Empty>
          {listMappingTargetFields(catalogIndex).map((field) => (
            <MenuCommand.Item
              key={field.id}
              value={field.id}
              keywords={[field.name]}
              className="h-auto min-h-10"
              onSelect={() => onAdd(field.id)}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{field.name}</span>
                <span className="text-grey-secondary truncate text-xs">{field.id}</span>
              </span>
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
