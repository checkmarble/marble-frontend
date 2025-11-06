import { useTranslation } from 'react-i18next';
import { Collapsible, Switch } from 'ui-design-system';

export const FilterTransactionByDecisionSkeleton = () => {
  const { t } = useTranslation(['scenarios']);

  return (
    <Collapsible.Container className="bg-grey-100">
      <Collapsible.Title>{t('scenarios:testrun.transaction_by_decision')}</Collapsible.Title>
      <Collapsible.Content>
        <div className="mb-6 flex items-center justify-end space-x-2">
          <span className="text-s text-grey-00 font-medium">{t('scenarios:testrun.show_rules_changes')}</span>
          <Switch id="show-changes" disabled />
        </div>

        <div className="space-y-2">
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="bg-grey-90 h-4 w-24 animate-pulse rounded-sm" />
            <div className="bg-grey-90 h-4 w-16 animate-pulse rounded-sm" />
          </div>

          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="border-grey-90 grid grid-cols-2 gap-4 rounded-lg border p-4 transition-colors">
              <div className="flex items-center space-x-2">
                <div className="bg-grey-90 size-4 animate-pulse rounded-sm" />
                <div className="bg-grey-90 h-4 w-32 animate-pulse rounded-sm" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-grey-90 h-4 w-16 animate-pulse rounded-sm" />
                <div className="bg-grey-90 size-4 animate-pulse rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
