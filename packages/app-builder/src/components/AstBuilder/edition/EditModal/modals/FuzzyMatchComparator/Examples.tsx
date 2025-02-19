import {
  type FuzzyMatchAlgorithm,
  isEditableFuzzyMatchAlgorithm,
} from '@app-builder/models/fuzzy-match';
import { useTranslation } from 'react-i18next';

export function Examples({
  algorithm,
  threshold,
}: {
  algorithm: FuzzyMatchAlgorithm;
  threshold: number;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  if (!isEditableFuzzyMatchAlgorithm(algorithm)) return null;

  return (
    <table className="border-grey-90 table-auto border-collapse border">
      <caption className="sr-only">{t('scenarios:edit_fuzzy_match.examples.caption')}</caption>
      <thead>
        <tr>
          <th className="text-grey-00 bg-grey-98 border-grey-90 border px-2 text-start text-xs font-normal capitalize">
            {t('scenarios:edit_fuzzy_match.examples.left')}
          </th>
          <th className="text-grey-00 bg-grey-98 border-grey-90 border px-2 text-start text-xs font-normal capitalize">
            {t('scenarios:edit_fuzzy_match.examples.right')}
          </th>
          <th className="text-grey-00 bg-grey-98 border-grey-90 border px-2 text-start text-xs font-normal capitalize">
            {t('scenarios:edit_fuzzy_match.examples.result')}
          </th>
        </tr>
      </thead>
      <tbody>
        {[
          {
            left: 'Mr Mrs John Jane OR Doe Smith',
            right: 'John Doe',
            score: {
              ratio: 43,
              token_set_ratio: 100,
            },
          },
          {
            left: 'the dog was walking on the sidewalk',
            right: "the d og as walkin' on the side alk",
            score: {
              ratio: 91,
              token_set_ratio: 72,
            },
          },
        ].map(({ left, right, score }) => (
          <tr key={`${left}-${right}`}>
            <td className="text-grey-00 border-grey-90 border px-2 text-xs font-normal">{left}</td>
            <td className="text-grey-00 border-grey-90 border px-2 text-xs font-normal">{right}</td>
            <td className="text-grey-00 border-grey-90 border px-2 text-xs font-normal">
              {t(`common:${score[algorithm] > threshold}`)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
