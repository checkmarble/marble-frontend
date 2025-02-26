import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';

export const DistributionOfDecisionChartSkeleton = () => {
  const { t } = useTranslation(['scenarios']);

  return (
    <Collapsible.Container className="bg-grey-100" defaultOpen={true}>
      <Collapsible.Title>{t('scenarios:testrun.distribution')}</Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-8">
          <div className="bg-grey-95 w-48 animate-pulse rounded-lg p-1">
            <div className="flex space-x-1">
              <div className="h-8 w-24 rounded-md" />
              <div className="bg-grey-90 h-8 w-24 animate-pulse rounded-md" />
            </div>
          </div>

          <div className="flex size-full flex-row items-center justify-center gap-10 px-8">
            <div className="flex size-full flex-col items-center gap-4">
              <div className="bg-grey-90 size-6 animate-pulse rounded-md" />
              <div className="flex size-full flex-col gap-1">
                <div className="bg-green-94 h-10 w-full animate-pulse rounded-md" />
                <div className="bg-red-95 h-10 w-full animate-pulse rounded-md" />
                <div className="bg-orange-95 h-10 w-full animate-pulse rounded-md" />
                <div className="bg-yellow-90 h-10 w-full animate-pulse rounded-md" />
              </div>
            </div>

            <div className="bg-grey-95 h-6 w-16 animate-pulse rounded-md" />

            <div className="flex size-full flex-col items-center gap-4">
              <div className="bg-grey-90 size-6 animate-pulse rounded-md" />
              <div className="flex size-full flex-col gap-1">
                <div className="bg-green-94 h-10 w-full animate-pulse rounded-md" />
                <div className="bg-red-95 h-10 w-full animate-pulse rounded-md" />
                <div className="bg-orange-95 h-10 w-full animate-pulse rounded-md" />
                <div className="bg-yellow-90 h-10 w-full animate-pulse rounded-md" />
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-center gap-4 px-24">
            <div className="bg-grey-90 h-6 w-11 animate-pulse rounded-md" />
            <div className="bg-grey-90 h-6 w-16 animate-pulse rounded-md" />
            <div className="bg-grey-90 h-6 w-8 animate-pulse rounded-md" />
            <div className="bg-grey-90 h-6 w-24 animate-pulse rounded-md" />
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
