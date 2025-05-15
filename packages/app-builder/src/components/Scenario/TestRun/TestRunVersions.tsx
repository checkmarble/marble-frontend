import type { ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const TestRunVersions = ({
  iterations,
  refIterationId,
  testIterationId,
}: {
  refIterationId: string;
  testIterationId: string;
  iterations: Record<string, Pick<ScenarioIterationWithType, 'version' | 'type'>>;
}) => {
  const { t } = useTranslation(['common']);

  return (
    <div className="flex flex-row items-center gap-1">
      <Tag size="big" color="grey-light" className="border-grey-90 gap-1 border px-4 py-2">
        <span className="text-grey-00 font-semibold">
          {`V${iterations[refIterationId]?.version}`}
        </span>
        {iterations[refIterationId]?.type === 'live version' ? (
          <span className="text-purple-65 font-semibold">{t('common:live')}</span>
        ) : null}
      </Tag>
      <Icon icon="arrow-range" className="text-grey-00 size-5" />
      <Tag size="big" color="grey-light" className="border-grey-90 border px-4 py-2">
        {`V${iterations[testIterationId]?.version}`}
      </Tag>
    </div>
  );
};
