import { type ScenarioIterationWithType } from '@app-builder/models/scenario/iteration';
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
    <div className="flex flex-row items-center gap-xs">
      <Tag size="big" color="grey" className="border-grey-border gap-xs border px-sm py-xs">
        <span className="text-grey-primary font-semibold">{`V${iterations[refIterationId]?.version}`}</span>
        {iterations[refIterationId]?.type === 'live version' ? (
          <span className="text-purple-primary font-semibold">{t('common:live')}</span>
        ) : null}
      </Tag>
      <Icon icon="arrow-range" className="text-grey-primary size-5" />
      <Tag size="big" color="grey" className="border-grey-border border px-sm py-xs">
        {`V${iterations[testIterationId]?.version}`}
      </Tag>
    </div>
  );
};
