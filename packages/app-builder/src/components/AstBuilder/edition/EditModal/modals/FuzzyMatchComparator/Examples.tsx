import {
  type BaseFuzzyMatchConfig,
  type FuzzyMatchAlgorithm,
} from '@app-builder/models/fuzzy-match/baseFuzzyMatchConfig';
import { useTranslation } from 'react-i18next';

export function Examples({
  config,
  algorithm,
  threshold,
}: {
  config: BaseFuzzyMatchConfig;
  algorithm: FuzzyMatchAlgorithm;
  threshold: number;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  if (!config.isEditableAlgorithm(algorithm)) return null;

  return (
    <table className="border-grey-border table-auto border-collapse border">
      <caption className="sr-only">{t('scenarios:edit_fuzzy_match.examples.caption')}</caption>
      <thead>
        <tr>
          <th className="text-grey-primary bg-grey-background-light border-grey-border border px-2 text-start text-xs font-normal">
            {t('scenarios:edit_fuzzy_match.examples.left')}
          </th>
          <th className="text-grey-primary bg-grey-background-light border-grey-border border px-2 text-start text-xs font-normal">
            {t('scenarios:edit_fuzzy_match.examples.right')}
          </th>
          <th className="text-grey-primary bg-grey-background-light border-grey-border border px-2 text-start text-xs font-normal">
            {t('scenarios:edit_fuzzy_match.examples.result')}
          </th>
        </tr>
      </thead>
      <tbody>
        {config.examples.map(({ left, right, resultsScores }) => {
          if (!(algorithm in resultsScores)) return null; // Ensure the algorithm key exists
          return (
            <tr key={`${left}-${right}`}>
              <td className="text-grey-primary border-grey-border border px-2 text-xs font-normal">{left}</td>
              <td className="text-grey-primary border-grey-border border px-2 text-xs font-normal">{right}</td>
              <td className="text-grey-primary border-grey-border border px-2 text-xs font-normal">
                {t(`common:${resultsScores[algorithm]! > threshold}`)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
