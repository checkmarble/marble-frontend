import type {
  BaseFuzzyMatchConfig,
  Level,
} from '@app-builder/models/fuzzy-match/baseFuzzyMatchConfig';
import { useTranslation } from 'react-i18next';
import { Select } from 'ui-design-system';

import { operatorContainerClassnames } from '../../../OperatorSelect';

interface EditLevelProps {
  config: BaseFuzzyMatchConfig;
  level: Level;
  setLevel: (level: Level) => void;
}

export function EditLevel({ config, level, setLevel }: EditLevelProps) {
  const { t } = useTranslation(['common', 'scenarios']);

  return (
    <div className="flex flex-1 flex-col gap-2">
      <label htmlFor="level" className="text-m text-grey-00 font-normal">
        {t('scenarios:edit_fuzzy_match.level.label')}
      </label>
      <Select.Root value={level} onValueChange={setLevel}>
        <Select.Trigger id="level" className={operatorContainerClassnames()}>
          <span className="text-s text-grey-00 w-full text-center font-medium">
            <Select.Value placeholder="..." />
          </span>
        </Select.Trigger>
        <Select.Content className="max-h-60">
          <Select.Viewport>
            {config.getLevels().map((level) => {
              return (
                <Select.Item className="min-w-[110px]" key={level} value={level}>
                  <Select.ItemText>
                    <span className="text-s text-grey-00 font-semibold uppercase">
                      {t(`scenarios:edit_fuzzy_match.level.${level}`, {
                        defaultValue: level,
                      })}
                    </span>
                  </Select.ItemText>
                </Select.Item>
              );
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
    </div>
  );
}
