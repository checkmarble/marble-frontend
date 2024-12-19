import { CalloutV2 } from '@app-builder/components/Callout';
import { Hovercard, HovercardAnchor, HovercardProvider } from '@ariakit/react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

const Nudge = () => {
  const { t } = useTranslation(['scenarios', 'common']);

  return (
    <HovercardProvider showTimeout={0} hideTimeout={0} placement="right">
      <HovercardAnchor
        tabIndex={-1}
        className="text-grey-00 absolute -right-3 -top-3 flex size-6 flex-row items-center justify-center rounded bg-purple-50"
      >
        <Icon icon="lock" className="size-3.5" aria-hidden />
      </HovercardAnchor>
      <Hovercard
        portal
        gutter={8}
        className="bg-grey-00 flex w-60 flex-col items-center gap-6 rounded border border-purple-50 p-4 shadow-lg"
      >
        <span className="text-m font-bold">{t('common:premium')}</span>
        <div className="flex flex-col items-center gap-2">
          <p className="text-s text-center font-medium">
            {t('scenarios:testrun.nudge')}
          </p>
          <a
            className="text-s text-purple-100 hover:underline"
            target="_blank"
            rel="noreferrer"
            href="https://checkmarble.com/docs"
          >
            https://checkmarble.com/docs
          </a>
        </div>
        <Button variant="primary" className="mt-4">
          {t('common:upgrade')}
        </Button>
      </Hovercard>
    </HovercardProvider>
  );
};

export const TestRunNudge = () => {
  const { t } = useTranslation(['scenarios']);

  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-grey-100 text-m font-semibold">
        {t('scenarios:home.testrun')}
      </h2>
      <div className="flex max-w-[500px] flex-row gap-4">
        <div className="bg-grey-00 relative flex h-fit flex-col gap-4 rounded-lg border-2 border-purple-50 p-8">
          <Nudge />
          <CalloutV2>
            <div className="flex flex-col gap-4">
              <span>{t('scenarios:testrun.description')}</span>
            </div>
          </CalloutV2>
          <Button variant="primary" disabled className="isolate h-10 w-fit">
            <Icon icon="plus" className="size-6" aria-hidden />
            {t('scenarios:create_testrun.title')}
          </Button>
        </div>
      </div>
    </section>
  );
};
