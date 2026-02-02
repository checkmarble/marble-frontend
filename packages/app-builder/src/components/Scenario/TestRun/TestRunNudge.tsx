import { CalloutV2 } from '@app-builder/components/Callout';
import { Nudge } from '@app-builder/components/Nudge';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useTranslation } from 'react-i18next';
import { ButtonV2, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const TestRunNudge = ({ kind }: { kind: Exclude<FeatureAccessLevelDto, 'allowed' | 'test'> }) => {
  const { t } = useTranslation(['scenarios']);

  return (
    <section
      className={cn('bg-surface-card relative flex h-fit max-w-[500px] flex-col gap-4 rounded-lg border-2 p-8', {
        'border-purple-disabled': kind === 'restricted',
        'border-yellow-primary': kind === 'missing_configuration',
      })}
    >
      <h3 className="text-grey-primary text-l font-bold">{t('scenarios:home.testrun')}</h3>

      <Nudge kind={kind} className="absolute -right-3 -top-3 size-6" content={t('scenarios:testrun.nudge')} />

      <CalloutV2>{t('scenarios:testrun.description')}</CalloutV2>

      <div className="flex flex-row gap-4">
        <ButtonV2 variant="primary" disabled className="isolate h-10 w-fit">
          <Icon icon="plus" className="size-5" aria-hidden />
          {t('scenarios:create_testrun.title')}
        </ButtonV2>
      </div>
    </section>
  );
};
