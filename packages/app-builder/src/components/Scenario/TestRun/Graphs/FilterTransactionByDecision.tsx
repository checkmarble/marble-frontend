import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsible, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const FilterTransactionByDecision = () => {
  const { t } = useTranslation(['scenarios']);
  const [displayRulesChange, toggleDisplayRulesChange] = useState(true);

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>
        {t('scenarios:testrun.transaction_by_decision')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-8">
          <div className="flex w-full flex-row items-center justify-end gap-2">
            <span className="text-s text-grey-100 font-medium">
              {t('scenarios:testrun.show_rules_changes')}
            </span>
            <Switch
              checked={displayRulesChange}
              onCheckedChange={toggleDisplayRulesChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid-cols-ts-by-ds text-s grid w-full font-semibold">
              <span />
              <span>{t('scenarios:testrun.filters.rule_name')}</span>
              <span>{t('scenarios:testrun.filters.alerts')}</span>
              <span>{t('scenarios:testrun.filters.score')}</span>
            </div>
            <Collapsible.Container>
              <div className="grid-cols-ts-by-ds grid w-full items-center">
                <Collapsible.Title size="small" />
                <div className="flex flex-col">
                  <span className="text-s font-normal">
                    Large Transaction Amount
                  </span>
                  <span className="text-grey-50 inline-flex flex-row items-center gap-2">
                    <Icon icon="arrow-top-left" className="size-2" />
                    <span className="text-xs">Large Transaction Amount</span>
                  </span>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <span className="text-s text-grey-50 font-normal">53%</span>
                  <div className="bg-purple-10 flex flex-row items-center justify-center rounded p-1.5">
                    <Icon
                      icon="arrow-forward"
                      className="size-2.5 -rotate-90 text-purple-100"
                    />
                  </div>
                  <span className="text-s text-grey-100 font-normal">64%</span>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <span className="text-s text-grey-50 font-normal">100</span>
                  <div className="bg-purple-10 flex flex-row items-center justify-center rounded p-1.5">
                    <Icon
                      icon="arrow-forward"
                      className="size-2.5 -rotate-90 text-purple-100"
                    />
                  </div>
                  <span className="text-s text-grey-100 font-normal">120</span>
                </div>
              </div>
              <Collapsible.Content>
                <div>World</div>
              </Collapsible.Content>
            </Collapsible.Container>
            <Collapsible.Container>
              <div className="grid-cols-ts-by-ds grid w-full items-center">
                <Collapsible.Title size="small" />
                <div className="flex flex-col">
                  <span className="text-s font-normal">
                    Large Transaction Amount
                  </span>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <div className="bg-grey-05 flex size-6 flex-row items-center justify-center rounded">
                    <Icon icon="dash" className="fill-grey-50 size-2" />
                  </div>
                  <span className="text-s text-grey-100 font-normal">64%</span>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <div className="bg-grey-05 flex size-6 flex-row items-center justify-center rounded">
                    <Icon icon="dash" className="fill-grey-50 size-2" />
                  </div>
                  <span className="text-s text-grey-100 font-normal">120</span>
                </div>
              </div>
              <Collapsible.Content>
                <div>World</div>
              </Collapsible.Content>
            </Collapsible.Container>
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
