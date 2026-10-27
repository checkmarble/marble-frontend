import type { TracfinMapping } from '@app-builder/models/tracfin';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Collapsible, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import {
  addDiscriminatorValue,
  removeDiscriminator,
  removeDiscriminatorValue,
  setDiscriminatorField,
  updateDiscriminatorValue,
} from './mapping-edits';

type DiscriminatorEditorProps = {
  mapping: TracfinMapping;
  /** Field names of the source, offered as suggestions. */
  fieldSuggestions: readonly string[];
  onChange: (mapping: TracfinMapping) => void;
};

/**
 * Optional: the mapping only applies to the source records whose `field` holds one of the accepted
 * values. Collapsed unless the mapping already has one.
 */
export function DiscriminatorEditor({ mapping, fieldSuggestions, onChange }: DiscriminatorEditorProps) {
  const { t } = useTranslation(['tracfin']);
  const listId = useId();
  const { discriminator } = mapping;

  return (
    <Collapsible.Container defaultOpen={discriminator !== undefined}>
      <Collapsible.Title size="small">{t('tracfin:settings.mapping.discriminator.title')}</Collapsible.Title>
      <Collapsible.Content size="small">
        <div className="flex flex-col gap-sm">
          <p className="text-grey-secondary text-xs">{t('tracfin:settings.mapping.discriminator.description')}</p>
          {discriminator === undefined ? (
            <Button
              variant="secondary"
              appearance="stroked"
              className="self-start"
              onClick={() => onChange(addDiscriminatorValue(setDiscriminatorField(mapping, '')))}
            >
              <Icon icon="plus" className="size-4" />
              {t('tracfin:settings.mapping.discriminator.add')}
            </Button>
          ) : (
            <>
              <div className="flex flex-col gap-xs">
                <span className="text-s">{t('tracfin:settings.mapping.discriminator.field')}</span>
                <Input
                  size="medium"
                  list={listId}
                  value={discriminator.field}
                  aria-label={t('tracfin:settings.mapping.discriminator.field')}
                  onChange={(event) => onChange(setDiscriminatorField(mapping, event.currentTarget.value))}
                />
                <datalist id={listId}>
                  {fieldSuggestions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-xs">
                <span className="text-s">{t('tracfin:settings.mapping.discriminator.values')}</span>
                {discriminator.values.map((value, index) => (
                  <div key={index} className="flex items-center gap-xs">
                    <Input
                      size="medium"
                      className="flex-1"
                      value={value}
                      aria-label={t('tracfin:settings.mapping.discriminator.value_aria', { number: index + 1 })}
                      onChange={(event) =>
                        onChange(updateDiscriminatorValue(mapping, index, event.currentTarget.value))
                      }
                    />
                    <Button
                      variant="secondary"
                      appearance="link"
                      mode="icon"
                      aria-label={t('tracfin:settings.mapping.discriminator.remove_value_aria', { number: index + 1 })}
                      onClick={() => onChange(removeDiscriminatorValue(mapping, index))}
                    >
                      <Icon icon="delete" className="size-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-xs">
                  <Button
                    variant="secondary"
                    appearance="stroked"
                    onClick={() => onChange(addDiscriminatorValue(mapping))}
                  >
                    <Icon icon="plus" className="size-4" />
                    {t('tracfin:settings.mapping.discriminator.add_value')}
                  </Button>
                  <Button
                    variant="destructive"
                    appearance="stroked"
                    onClick={() => onChange(removeDiscriminator(mapping))}
                  >
                    {t('tracfin:settings.mapping.discriminator.remove')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}
