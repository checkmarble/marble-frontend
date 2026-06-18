import { CalloutV2 } from '@app-builder/components/Callout';
import { Nudge } from '@app-builder/components/Nudge';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useTranslation } from 'react-i18next';
import { Button, cn, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const WorkflowNudge = ({ kind }: { kind: Exclude<FeatureAccessLevelDto, 'allowed' | 'test'> }) => {
  const { t } = useTranslation(['scenarios', 'workflows']);

  return (
    <section
      className={cn('bg-surface-card relative flex h-fit max-w-[500px] flex-col gap-md rounded-lg border-2 p-xl', {
        'border-purple-disabled': kind === 'restricted',
        'border-yellow-primary': kind === 'missing_configuration',
      })}
    >
      <Typo variant="subtitle1">{t('scenarios:home.workflow')}</Typo>

      <Nudge kind={kind} className="absolute -right-3 -top-3 size-6" content={t('workflows:nudge')} />

      <CalloutV2>{t('scenarios:home.workflow_description')}</CalloutV2>

      <div className="flex flex-row gap-md">
        <Button variant="primary" disabled className="isolate h-10 w-fit">
          <Icon icon="plus" className="size-5" aria-hidden />
          {t('scenarios:home.workflow.create')}
        </Button>
      </div>
    </section>
  );
};
