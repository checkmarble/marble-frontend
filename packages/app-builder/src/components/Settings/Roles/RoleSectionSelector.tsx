import { APP_SECTIONS, type AppSection, type SectionsVisibility } from '@app-builder/models/custom-role-sections';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, HeadlessCollapsible } from 'ui-design-system';
import { Icon } from 'ui-icons';

// Reuse the sidebar labels so each section is named the same way everywhere in the app.
const sectionLabelKeys = {
  scenarios: 'navigation:scenarios',
  customer_scoring: 'navigation:user_scoring',
  continuous_monitoring: 'navigation:continuous_screening',
  case_manager: 'navigation:case_manager',
  manual_screening: 'navigation:screening_search',
  customer_hub: 'navigation:client_detail',
  data_model: 'navigation:data.list',
  settings: 'navigation:settings',
} as const satisfies Record<AppSection, string>;

export function RoleSectionSelector({
  value,
  onChange,
}: {
  value: SectionsVisibility;
  onChange: (sections: SectionsVisibility) => void;
}) {
  const { t } = useTranslation(['settings', 'navigation']);
  const idPrefix = useId();

  const hiddenCount = APP_SECTIONS.filter((section) => !value[section]).length;

  return (
    <HeadlessCollapsible.Root defaultOpen={false} className="flex flex-col gap-sm">
      <HeadlessCollapsible.Trigger asChild>
        <button
          type="button"
          className="group flex cursor-pointer items-center justify-between gap-sm rounded-sm text-start focus-visible:outline-2 focus-visible:outline-purple-primary"
        >
          <span className="flex items-baseline gap-sm">
            <span id={`${idPrefix}-label`}>{t('settings:custom_roles.sections')}</span>
            {hiddenCount > 0 ? (
              <span className="text-grey-secondary text-s">
                {t('settings:custom_roles.sections_hidden_count', { count: hiddenCount })}
              </span>
            ) : null}
          </span>
          <Icon
            icon="smallarrow-up"
            aria-hidden
            className="size-6 rounded-sm border border-grey-border transition-transform duration-200 group-radix-state-open:rotate-180"
          />
        </button>
      </HeadlessCollapsible.Trigger>
      <HeadlessCollapsible.Content>
        <div className="flex flex-col gap-sm">
          <p id={`${idPrefix}-hint`} className="text-grey-secondary text-s">
            {t('settings:custom_roles.sections_hint')}
          </p>
          <div
            role="group"
            aria-labelledby={`${idPrefix}-label`}
            aria-describedby={`${idPrefix}-hint`}
            className="relative flex flex-col rounded-md border border-grey-border"
          >
            {APP_SECTIONS.map((section) => {
              const id = `${idPrefix}-${section}`;
              return (
                <label key={section} htmlFor={id} className="flex cursor-pointer items-center gap-sm p-md text-s">
                  <Checkbox
                    id={id}
                    size="small"
                    checked={value[section]}
                    onCheckedChange={(checked) => onChange({ ...value, [section]: checked === true })}
                  />
                  {t(sectionLabelKeys[section])}
                </label>
              );
            })}
          </div>
        </div>
      </HeadlessCollapsible.Content>
    </HeadlessCollapsible.Root>
  );
}
