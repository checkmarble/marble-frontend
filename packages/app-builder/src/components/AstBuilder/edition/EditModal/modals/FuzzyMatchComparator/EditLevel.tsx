import { type BaseFuzzyMatchConfig, type Level } from '@app-builder/models/fuzzy-match/baseFuzzyMatchConfig';
import { useTranslation } from 'react-i18next';
import { SelectV2 } from 'ui-design-system';

import { operatorContainerClassnames } from '../../../OperatorSelect';

interface EditLevelProps {
  config: BaseFuzzyMatchConfig;
  level: Level;
  setLevel: (level: Level) => void;
}

export function EditLevel({ config, level, setLevel }: EditLevelProps) {
  const { t } = useTranslation(['common', 'scenarios']);

  return (
    <div className="flex flex-1 flex-col gap-sm">
      <label htmlFor="level" className="text-m text-grey-primary font-normal">
        {t('scenarios:edit_fuzzy_match.level.label')}
      </label>
      <SelectV2
        value={level}
        onChange={setLevel}
        placeholder="..."
        className={operatorContainerClassnames()}
        options={config.getLevels().map((level) => ({
          label: (
            <span className="text-s text-grey-primary font-semibold uppercase">
              {t(`scenarios:edit_fuzzy_match.level.${level}`, {
                defaultValue: level,
              })}
            </span>
          ),
          value: level,
        }))}
      />
    </div>
  );
}
