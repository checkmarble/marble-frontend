import { SEARCH_ENTITIES, type SearchableSchema } from '@app-builder/constants/screening-entity';
import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Icon } from 'ui-icons';

import { screeningsI18n } from '../screenings-i18n';

export interface EntityTypePopoverProps {
  value: SearchableSchema | undefined;
  onApply: (value: SearchableSchema) => void;
}

export const EntityTypePopover = ({ value, onApply }: EntityTypePopoverProps) => {
  const { t } = useTranslation(screeningsI18n);
  const [open, setOpen] = useState(false);

  const handleSelect = (schema: SearchableSchema) => {
    onApply(schema);
    setOpen(false);
  };

  const hasSelection = value && value !== 'Thing';
  const schemas = R.keys(SEARCH_ENTITIES);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={clsx(
            'text-s flex w-full items-center justify-between rounded px-2 py-2',
            hasSelection
              ? 'bg-purple-background-light text-purple-primary'
              : 'border-grey-border text-grey-secondary bg-surface-card border',
          )}
        >
          <span className="font-medium">{t('screenings:freeform_search.entity_type_label')}</span>
          <div className="flex items-center gap-1">
            {hasSelection && (
              <span className="bg-surface-card text-grey-primary border-grey-border rounded-full border px-1.5 text-xs font-semibold">
                1
              </span>
            )}
            <Icon icon="caret-down" className="size-4" />
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-surface-card border-grey-border z-50 flex w-[400px] flex-col rounded-lg border shadow-lg"
          sideOffset={4}
          align="start"
        >
          {/* Entity type list */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {schemas.map((schema) => {
              const schemaKey = schema.toLowerCase() as Lowercase<typeof schema>;
              const fieldForSchema = SEARCH_ENTITIES[schema].fields;
              const isSelected = value === schema;

              return (
                <button
                  key={schema}
                  type="button"
                  onClick={() => handleSelect(schema)}
                  className={clsx(
                    'text-s flex w-full items-center gap-2 rounded px-3 py-2 text-left',
                    isSelected ? 'bg-purple-background-light text-purple-primary' : 'hover:bg-grey-background-light',
                  )}
                >
                  <div className="flex flex-1 flex-col">
                    <span className="font-medium">{t(`screenings:refine_modal.schema.${schemaKey}`)}</span>
                    <span className="text-grey-placeholder text-xs">
                      {t('screenings:refine_modal.search_by')}{' '}
                      {fieldForSchema.map((f) => t(`screenings:entity.property.${f}`)).join(', ')}
                    </span>
                  </div>
                  {isSelected && <Icon icon="tick" className="text-purple-primary size-4" />}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
