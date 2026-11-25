import {
  type BaseFuzzyMatchConfig,
  type FuzzyMatchAlgorithm,
} from '@app-builder/models/fuzzy-match/baseFuzzyMatchConfig';
import { useCallbackRef } from '@marble/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { operatorContainerClassnames } from '../../../OperatorSelect';

interface EditAlgorithmProps {
  fuzzyMatchConfig: BaseFuzzyMatchConfig;
  algorithm: FuzzyMatchAlgorithm;
  onChange: (value: FuzzyMatchAlgorithm) => void;
}

export function EditAlgorithm({ fuzzyMatchConfig, algorithm, onChange }: EditAlgorithmProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const [open, setOpen] = useState(false);
  const onValueChange = useCallbackRef(onChange);

  if (fuzzyMatchConfig.isEditableAlgorithm(algorithm)) {
    return (
      <div className="flex flex-1 flex-col gap-sm">
        <label htmlFor="algorithm" className="text-m text-grey-primary font-normal">
          {t('scenarios:edit_fuzzy_match.algorithm.label')}
        </label>
        <MenuCommand.Menu open={open} onOpenChange={setOpen}>
          <MenuCommand.Trigger>
            <button type="button" id="algorithm" role="combobox" className={operatorContainerClassnames()}>
              <span className="text-s text-grey-primary w-full text-center font-medium">
                <FuzzyMatchAlgorithmLabel fuzzyMatchConfig={fuzzyMatchConfig} fuzzyMatchAlgorithm={algorithm} />
              </span>
              <Tooltip.Default content={t(`scenarios:edit_fuzzy_match.algorithm.description.${algorithm}`)}>
                <Icon
                  icon="tip"
                  className="hover:text-purple-primary text-purple-disabled size-5 shrink-0 transition-colors"
                />
              </Tooltip.Default>
            </button>
          </MenuCommand.Trigger>
          <MenuCommand.Content align="start" sideOffset={4} className="max-h-60">
            <MenuCommand.List>
              {Array.from(fuzzyMatchConfig.editablesAlgorithms).map((fuzzyMatchAlgorithm) => {
                return (
                  <MenuCommand.Item
                    role="option"
                    className="flex h-auto min-w-[110px] flex-col items-start gap-xs"
                    key={fuzzyMatchAlgorithm}
                    value={fuzzyMatchAlgorithm}
                    onSelect={() => onValueChange(fuzzyMatchAlgorithm)}
                  >
                    <FuzzyMatchAlgorithmLabel
                      fuzzyMatchConfig={fuzzyMatchConfig}
                      fuzzyMatchAlgorithm={fuzzyMatchAlgorithm}
                    />
                    <p className="text-s text-grey-secondary">
                      {t(`scenarios:edit_fuzzy_match.algorithm.description.${fuzzyMatchAlgorithm}`)}
                    </p>
                  </MenuCommand.Item>
                );
              })}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-sm">
      <span className="text-m text-grey-primary font-normal">{t('scenarios:edit_fuzzy_match.algorithm.label')}</span>
      <div className="bg-grey-background-light border-grey-border flex h-10 items-center justify-center rounded-sm border p-sm text-center">
        <FuzzyMatchAlgorithmLabel fuzzyMatchConfig={fuzzyMatchConfig} fuzzyMatchAlgorithm={algorithm} />
      </div>
    </div>
  );
}

function FuzzyMatchAlgorithmLabel({
  fuzzyMatchConfig,
  fuzzyMatchAlgorithm,
}: {
  fuzzyMatchConfig: BaseFuzzyMatchConfig;
  fuzzyMatchAlgorithm: FuzzyMatchAlgorithm;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  return (
    <span className="text-s text-grey-primary font-semibold">
      {fuzzyMatchConfig.getAlgorithmName(t, fuzzyMatchAlgorithm)}
    </span>
  );
}
