import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';

export function Examples({ divider }: { divider: number }) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();

  return (
    <table className="border-grey-90 table-auto border-collapse border">
      <caption className="sr-only">{t('scenarios:edit_is_multiple_of.examples.caption')}</caption>
      <thead>
        <tr>
          <th className="text-grey-00 bg-grey-98 border-grey-90 border px-2 text-start text-xs font-normal capitalize">
            {t('scenarios:edit_is_multiple_of.examples.value')}
          </th>
          <th className="text-grey-00 bg-grey-98 border-grey-90 border px-2 text-start text-xs font-normal capitalize">
            {t('scenarios:edit_is_multiple_of.examples.result')}
          </th>
        </tr>
      </thead>
      <tbody>
        {[
          {
            left: 5,
          },
          {
            left: 20,
          },
          {
            left: 700,
          },
          {
            left: 2000,
          },
          {
            left: 380000,
          },
          {
            left: 380002,
          },
          {
            left: 380002.1,
          },
        ].map(({ left }) => (
          <tr key={`${left}`}>
            <td className="text-grey-00 border-grey-90 border px-2 text-xs font-normal">
              {formatNumber(left, {
                language,
                style: undefined,
              })}
            </td>
            <td className="text-grey-00 border-grey-90 border px-2 text-xs font-normal">
              {t(`common:${left % divider === 0}`)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
