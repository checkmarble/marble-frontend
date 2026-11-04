import type { TracfinFieldInput } from '@app-builder/models/tracfin';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, cn, Input, Switch, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { toCodeOptions } from './code-options';
import { describeConfigurationErrorCode } from './configuration-error-text';
import { setSettingBoolean, setSettingText, settingText } from './form-state';
import { OptionPicker } from './OptionPicker';
import {
  TRACFIN_SETTINGS_BLOCK_IDS,
  type TracfinSettingsFieldItem,
  type TracfinSettingsSection,
} from './settings-layout';

const SECTION_TITLE_KEYS = {
  '/ds/organisme': 'tracfin:settings.organisation.sections.organisme',
  '/ds/organisme/adresse': 'tracfin:settings.organisation.sections.adresse',
  '/ds/contact': 'tracfin:settings.organisation.sections.contact',
  '/ds/contact/coordonnees': 'tracfin:settings.organisation.sections.contact',
} as const satisfies Record<(typeof TRACFIN_SETTINGS_BLOCK_IDS)[number], ParseKeys<['tracfin']>>;

/** `/ds/organisme/adresse/pays/@type` -> `organisme_adresse_pays_attr_type` */
function labelKeyOf(fieldId: string): string {
  return fieldId
    .replace(/^\/ds\//, '')
    .replace(/\/@/g, '_attr_')
    .replace(/\//g, '_');
}

type Settings = Record<string, TracfinFieldInput>;

type OrganisationSettingsFormProps = {
  layout: TracfinSettingsSection[];
  settings: Settings;
  onSettingsChange: (updater: (settings: Settings) => Settings) => void;
  /** Diagnostic codes by settings field id, from the last rejected save. */
  errors: Record<string, string[]>;
};

export function OrganisationSettingsForm({
  layout,
  settings,
  onSettingsChange,
  errors,
}: OrganisationSettingsFormProps) {
  const { t } = useTranslation(['tracfin']);

  return (
    <section aria-labelledby="tracfin-organisation-title" className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <Typo as="h2" variant="title2" id="tracfin-organisation-title">
          {t('tracfin:settings.organisation.title')}
        </Typo>
        <p className="text-s text-grey-secondary">{t('tracfin:settings.organisation.description')}</p>
      </div>
      <div className="grid gap-md lg:grid-cols-2">
        {layout.map((section) => (
          <fieldset
            key={section.blockId}
            className={cn(
              'border-grey-border bg-surface-card flex min-w-0 flex-col gap-md rounded-lg border p-md',
              // The address is the long section: it spans the rows of the two short ones beside it.
              section.blockId === '/ds/organisme/adresse' && 'lg:row-span-2',
            )}
          >
            <legend className="text-default px-xs font-semibold">
              {t(SECTION_TITLE_KEYS[section.blockId as keyof typeof SECTION_TITLE_KEYS])}
            </legend>
            {section.fields.map((item) => (
              <SettingField
                key={item.field.id}
                item={item}
                settings={settings}
                onSettingsChange={onSettingsChange}
                errors={errors}
              />
            ))}
          </fieldset>
        ))}
      </div>
    </section>
  );
}

type SettingFieldProps = {
  item: TracfinSettingsFieldItem;
  settings: Settings;
  onSettingsChange: OrganisationSettingsFormProps['onSettingsChange'];
  errors: Record<string, string[]>;
  nested?: boolean;
  /** An attribute needs the value of its scalar owner (the server refuses it otherwise). */
  ownerHasValue?: boolean;
};

function SettingField({
  item,
  settings,
  onSettingsChange,
  errors,
  nested = false,
  ownerHasValue = true,
}: SettingFieldProps) {
  const { t } = useTranslation(['tracfin']);
  const { field } = item;
  const input = settings[field.id];
  const label = t(`tracfin:settings.fields.${labelKeyOf(field.id)}` as ParseKeys<['tracfin']>, {
    defaultValue: field.name,
  });
  const hasValue = input !== undefined;
  const fieldErrors = errors[field.id] ?? [];
  const inputId = `tracfin-setting-${labelKeyOf(field.id)}`;
  const disabled = !ownerHasValue;
  const hasPlainControl = item.kind === 'boolean' || !Array.isArray(item.codes);

  return (
    <div className={cn('flex flex-col gap-xs', nested && 'border-grey-border ms-md border-s ps-md')}>
      <div className="flex flex-wrap items-center gap-xs">
        {hasPlainControl ? (
          <label htmlFor={inputId} className="text-s font-medium">
            {label}
          </label>
        ) : (
          // A code picker is a button named by its own aria-label: there is no field to point a label at.
          <span className="text-s font-medium">{label}</span>
        )}
        {item.expectedByTracfin ? (
          <Tag size="xs" color="orange">
            {t('tracfin:settings.organisation.expected_by_tracfin')}
          </Tag>
        ) : null}
      </div>

      <SettingControl
        item={item}
        inputId={inputId}
        label={label}
        input={input}
        disabled={disabled}
        hasError={fieldErrors.length > 0}
        onTextChange={(value) =>
          onSettingsChange((current) =>
            setSettingText(current, field.id, item.kind === 'decimal' ? 'decimal' : 'text', value),
          )
        }
        onBooleanChange={(value) => onSettingsChange((current) => setSettingBoolean(current, field.id, value))}
      />

      {item.codes === 'unavailable' ? (
        <p className="text-grey-secondary text-xs">{t('tracfin:settings.organisation.codes_unavailable')}</p>
      ) : null}
      {disabled ? (
        <p className="text-grey-secondary text-xs">{t('tracfin:settings.organisation.attribute_needs_owner')}</p>
      ) : null}
      {fieldErrors.length > 0 ? (
        <ul className="text-red-primary text-xs" aria-label={t('tracfin:settings.errors.of_field', { field: label })}>
          {fieldErrors.map((code) => (
            <li key={code}>{describeConfigurationErrorCode(t, code)}</li>
          ))}
        </ul>
      ) : null}

      {item.attributes.map((attribute) => (
        <SettingField
          key={attribute.field.id}
          item={attribute}
          settings={settings}
          onSettingsChange={onSettingsChange}
          errors={errors}
          nested
          ownerHasValue={hasValue}
        />
      ))}
    </div>
  );
}

function SettingControl({
  item,
  inputId,
  label,
  input,
  disabled,
  hasError,
  onTextChange,
  onBooleanChange,
}: {
  item: TracfinSettingsFieldItem;
  inputId: string;
  label: string;
  input: TracfinFieldInput | undefined;
  disabled: boolean;
  hasError: boolean;
  onTextChange: (value: string) => void;
  onBooleanChange: (value: boolean | null) => void;
}) {
  const { t } = useTranslation(['tracfin']);

  if (item.kind === 'boolean') {
    return (
      <Switch
        id={inputId}
        aria-label={label}
        disabled={disabled}
        checked={input?.boolean ?? false}
        onCheckedChange={(checked) => onBooleanChange(checked)}
      />
    );
  }

  if (Array.isArray(item.codes)) {
    const value = settingText(input);
    return (
      <div className="flex items-center gap-xs">
        <OptionPicker
          value={value || undefined}
          options={toCodeOptions(item.codes)}
          onChange={onTextChange}
          ariaLabel={label}
          placeholder={t('tracfin:settings.organisation.choose_code')}
          searchPlaceholder={t('tracfin:settings.organisation.search_code')}
          emptyLabel={t('tracfin:settings.organisation.no_code_found')}
          hasError={hasError}
          disabled={disabled}
          className="min-w-0 flex-1"
        />
        {value ? (
          <Button
            variant="secondary"
            appearance="link"
            mode="icon"
            aria-label={t('tracfin:settings.organisation.clear_value', { field: label })}
            disabled={disabled}
            onClick={() => onTextChange('')}
          >
            <Icon icon="cross" className="size-4" />
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <Input
      id={inputId}
      size="medium"
      value={settingText(input)}
      disabled={disabled}
      borderColor={hasError ? 'redfigma-47' : 'greyfigma-90'}
      onChange={(event) => onTextChange(event.currentTarget.value)}
    />
  );
}
