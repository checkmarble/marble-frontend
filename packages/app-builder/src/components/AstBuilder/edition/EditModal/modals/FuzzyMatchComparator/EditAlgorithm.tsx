import {
  editableFuzzyMatchAlgorithms,
  type FuzzyMatchAlgorithm,
  getFuzzyMatchAlgorithmName,
  isEditableFuzzyMatchAlgorithm,
} from '@app-builder/models/fuzzy-match';
import { useCallbackRef } from '@marble/shared';
import { useTranslation } from 'react-i18next';
import { Select, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { operatorContainerClassnames } from '../../../OperatorSelect';

interface EditAlgorithmProps {
  algorithm: FuzzyMatchAlgorithm;
  onChange: (value: FuzzyMatchAlgorithm) => void;
}

export function EditAlgorithm({ algorithm, onChange }: EditAlgorithmProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const onValueChange = useCallbackRef(onChange);

  if (isEditableFuzzyMatchAlgorithm(algorithm)) {
    return (
      <div className="flex flex-1 flex-col gap-2">
        <label htmlFor="algorithm" className="text-m text-grey-00 font-normal">
          {t('scenarios:edit_fuzzy_match.algorithm.label')}
        </label>
        <Select.Root value={algorithm} onValueChange={onValueChange}>
          <Select.Trigger id="algorithm" className={operatorContainerClassnames()}>
            <span className="text-s text-grey-00 w-full text-center font-medium">
              <Select.Value placeholder="..." />
            </span>
            <Tooltip.Default
              content={t(`scenarios:edit_fuzzy_match.algorithm.description.${algorithm}`)}
            >
              <Icon
                icon="tip"
                className="hover:text-purple-65 text-purple-82 size-5 shrink-0 transition-colors"
              />
            </Tooltip.Default>
          </Select.Trigger>
          <Select.Content className="max-h-60">
            <Select.Viewport>
              {editableFuzzyMatchAlgorithms.map((fuzzyMatchAlgorithm) => {
                return (
                  <Select.Item
                    className="flex min-w-[110px] flex-col gap-1"
                    key={fuzzyMatchAlgorithm}
                    value={fuzzyMatchAlgorithm}
                  >
                    <Select.ItemText>
                      <FuzzyMatchAlgorithmLabel fuzzyMatchAlgorithm={fuzzyMatchAlgorithm} />
                    </Select.ItemText>
                    <p className="text-s text-grey-50">
                      {t(`scenarios:edit_fuzzy_match.algorithm.description.${fuzzyMatchAlgorithm}`)}
                    </p>
                  </Select.Item>
                );
              })}
            </Select.Viewport>
          </Select.Content>
        </Select.Root>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <span className="text-m text-grey-00 font-normal">
        {t('scenarios:edit_fuzzy_match.threshold.label')}
      </span>
      <div className="bg-grey-98 border-grey-90 flex h-10 items-center justify-center rounded border p-2 text-center">
        <FuzzyMatchAlgorithmLabel fuzzyMatchAlgorithm={algorithm} />
      </div>
    </div>
  );
}

function FuzzyMatchAlgorithmLabel({
  fuzzyMatchAlgorithm,
}: {
  fuzzyMatchAlgorithm: FuzzyMatchAlgorithm;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  return (
    <span className="text-s text-grey-00 font-semibold">
      {getFuzzyMatchAlgorithmName(t, fuzzyMatchAlgorithm)}
    </span>
  );
}
