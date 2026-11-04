import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { toCodeOptions } from '../../Settings/code-options';
import { OptionPicker } from '../../Settings/OptionPicker';
import { textOf } from '../model/field-values';
import type { TracfinFieldControlProps } from './types';

/** A code picked from the list of the catalog (« value — label », with a search). */
export function CodeControl({
  label,
  occurrence,
  codes,
  disabled,
  onSet,
  onClear,
  onCommit,
}: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  const value = textOf(occurrence);
  if (!Array.isArray(codes)) return null;

  return (
    <div className="flex items-center gap-xs">
      <OptionPicker
        value={value || undefined}
        options={toCodeOptions(codes)}
        onChange={(next) => {
          onSet({ kind: 'text', text: next });
          onCommit();
        }}
        ariaLabel={label}
        placeholder={t('tracfin:draft.choose_code')}
        searchPlaceholder={t('tracfin:draft.search_code')}
        emptyLabel={t('tracfin:draft.no_code_found')}
        disabled={disabled}
        className="min-w-0 flex-1"
      />
      {value ? (
        <Button
          variant="secondary"
          appearance="link"
          mode="icon"
          aria-label={t('tracfin:draft.clear_value', { field: label })}
          disabled={disabled}
          onClick={() => {
            onClear();
            onCommit();
          }}
        >
          <Icon icon="cross" className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
