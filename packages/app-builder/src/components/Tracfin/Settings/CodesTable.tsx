import type { TracfinMapping } from '@app-builder/models/tracfin';
import type { TracfinFieldCodes } from '@app-builder/models/tracfin/catalog-index';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { toCodeOptions } from './code-options';
import { addCode, removeCode, updateCode } from './mapping-edits';
import { OptionPicker } from './OptionPicker';
import { useRowKeys } from './use-row-keys';

type CodesTableProps = {
  mapping: TracfinMapping;
  /** The codes of the target field: a list to choose from, or `'unavailable'` when its referential is not shipped. */
  codes: Exclude<TracfinFieldCodes, null>;
  onChange: (mapping: TracfinMapping) => void;
};

/**
 * Code correspondences: the source value is typed by the administrator (no value is guessed from the
 * data), the target is chosen in the referential of the field. Excluded codes are not in the list.
 */
export function CodesTable({ mapping, codes, onChange }: CodesTableProps) {
  const { t } = useTranslation(['tracfin']);
  const rows = mapping.codes ?? [];
  const rowKeys = useRowKeys(rows.length);
  const options = codes === 'unavailable' ? [] : toCodeOptions(codes);

  return (
    <div className="flex flex-col gap-sm">
      <p className="text-s font-medium">{t('tracfin:settings.mapping.codes.title')}</p>
      <p className="text-grey-secondary text-xs">{t('tracfin:settings.mapping.codes.description')}</p>

      {codes === 'unavailable' ? (
        <p className="text-orange-primary text-xs">{t('tracfin:settings.mapping.codes.unavailable')}</p>
      ) : rows.length === 0 ? (
        <p className="text-grey-secondary text-xs">{t('tracfin:settings.mapping.codes.none_configured')}</p>
      ) : null}

      {rows.length > 0 ? (
        <table className="w-full table-fixed border-separate border-spacing-y-xs">
          <thead>
            <tr className="text-grey-secondary text-start text-xs">
              <th scope="col" className="text-start font-medium">
                {t('tracfin:settings.mapping.codes.source')}
              </th>
              <th scope="col" className="text-start font-medium">
                {t('tracfin:settings.mapping.codes.target')}
              </th>
              <th scope="col" className="w-10">
                <span className="sr-only">{t('tracfin:settings.mapping.codes.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const unknownTarget =
                row.target !== '' && codes !== 'unavailable' && !options.some((option) => option.value === row.target);
              return (
                <tr key={rowKeys.keys[index]}>
                  <td className="pe-xs align-top">
                    <Input
                      size="medium"
                      value={row.source}
                      aria-label={t('tracfin:settings.mapping.codes.source_aria', { number: index + 1 })}
                      placeholder={t('tracfin:settings.mapping.codes.source_placeholder')}
                      onChange={(event) => onChange(updateCode(mapping, index, { source: event.currentTarget.value }))}
                    />
                  </td>
                  <td className="pe-xs align-top">
                    {codes === 'unavailable' ? (
                      <Input
                        size="medium"
                        value={row.target}
                        readOnly
                        aria-label={t('tracfin:settings.mapping.codes.target_aria', { number: index + 1 })}
                      />
                    ) : (
                      <OptionPicker
                        value={row.target || undefined}
                        options={options}
                        onChange={(target) => onChange(updateCode(mapping, index, { target }))}
                        ariaLabel={t('tracfin:settings.mapping.codes.target_aria', { number: index + 1 })}
                        placeholder={t('tracfin:settings.mapping.codes.target_placeholder')}
                        searchPlaceholder={t('tracfin:settings.organisation.search_code')}
                        emptyLabel={t('tracfin:settings.organisation.no_code_found')}
                        hasError={unknownTarget}
                      />
                    )}
                    {unknownTarget ? (
                      <p className="text-red-primary text-xs">{t('tracfin:settings.mapping.codes.not_offered')}</p>
                    ) : null}
                  </td>
                  <td className="align-top">
                    <Button
                      variant="secondary"
                      appearance="link"
                      mode="icon"
                      aria-label={t('tracfin:settings.mapping.codes.remove_aria', { number: index + 1 })}
                      onClick={() => {
                        rowKeys.remove(index);
                        onChange(removeCode(mapping, index));
                      }}
                    >
                      <Icon icon="delete" className="size-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}

      {codes === 'unavailable' ? null : (
        <Button
          variant="secondary"
          appearance="stroked"
          className="self-start"
          onClick={() => {
            rowKeys.add();
            onChange(addCode(mapping));
          }}
        >
          <Icon icon="plus" className="size-4" />
          {t('tracfin:settings.mapping.codes.add')}
        </Button>
      )}
    </div>
  );
}
