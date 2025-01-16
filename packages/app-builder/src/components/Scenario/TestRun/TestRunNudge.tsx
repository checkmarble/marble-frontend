import { CalloutV2 } from '@app-builder/components/Callout';
import { Nudge } from '@app-builder/components/Nudge';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const TestRunNudge = () => {
  const { t } = useTranslation(['scenarios']);

  return (
    <section className="bg-grey-100 border-purple-82 relative flex h-fit max-w-[500px] flex-col gap-4 rounded-lg border-2 p-8">
      <h3 className="text-grey-00 text-l font-bold">
        {t('scenarios:home.testrun')}
      </h3>

      <Nudge
        className="absolute -right-3 -top-3 size-6"
        content={t('scenarios:testrun.nudge')}
      />

      <CalloutV2>{t('scenarios:testrun.description')}</CalloutV2>

      <div className="flex flex-row gap-4">
        <Button variant="primary" disabled className="isolate h-10 w-fit">
          <Icon icon="plus" className="size-6" aria-hidden />
          {t('scenarios:create_testrun.title')}
        </Button>
      </div>
    </section>
  );
};
