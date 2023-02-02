import type { PlainMessage } from '@bufbuild/protobuf';
import type { FormulaAggregation as FormulaAggregationMessage } from '@marble-front/api/marble';
import { Aggregation as AggregationEnum } from '@marble-front/api/marble';
import { assertNever } from '@marble-front/builder/utils/assert-never';
import { Variable } from '@marble-front/ui/icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { scenarioI18n } from '../scenario-i18n';
import { NotImplemented } from './NotImplemented';
import { Formula } from './Formula';
import { ScenarioRightPannel } from '../ScenarioRightPannel';

function useGetAggregation() {
  const { t } = useTranslation(scenarioI18n);
  return useCallback(
    (aggregation: AggregationEnum) => {
      switch (aggregation) {
        case AggregationEnum.COUNT:
          return t('scenarios:rules.aggregation.count');
        case AggregationEnum.SUM:
          return t('scenarios:rules.aggregation.sum');
        case AggregationEnum.MEAN:
          return t('scenarios:rules.aggregation.mean');
        case AggregationEnum.MAX:
          return t('scenarios:rules.aggregation.max');
        case AggregationEnum.MIN:
          return t('scenarios:rules.aggregation.min');
        default:
          assertNever('unknwon Aggregation :', aggregation);
      }
    },
    [t]
  );
}

function FormulaAggregationPannelContent({
  formulaAggregation,
}: {
  formulaAggregation: PlainMessage<FormulaAggregationMessage>;
}) {
  const { t } = useTranslation(scenarioI18n);
  const getAggregation = useGetAggregation();

  return (
    <div className={'flex flex-col gap-2 text-xs lg:gap-4'}>
      <div>
        <p className="text-grey-25 font-medium">Name</p>
        <p>count_last60days_trx</p>
      </div>
      <div>
        <p className="text-grey-25 font-medium">Function</p>
        <p className="text-grey-100 font-semibold">
          {getAggregation(formulaAggregation.aggregation)}{' '}
          <span className="text-purple-100">Transactions</span>
        </p>
      </div>

      {formulaAggregation.filters.length > 0 && (
        <div className="bg-grey-10 h-[1px] w-full" />
      )}
      {formulaAggregation.filters.map((filter, index) => {
        return (
          <div key={index}>
            <p className="text-grey-25 font-medium">
              {index === 0
                ? t('scenarios:logical_operator.where')
                : t('scenarios:logical_operator.and')}
            </p>
            <div className="flex flex-row gap-1">
              <Formula formula={filter} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FormulaAggregationTrigger({
  formulaAggregation,
}: {
  formulaAggregation: PlainMessage<FormulaAggregationMessage>;
}) {
  return (
    <ScenarioRightPannel.Trigger
      data={{ type: 'formulaAggregation', formulaAggregation }}
    >
      <span className="flex flex-row items-center font-medium text-purple-100">
        <Variable height="16px" width="16px" />
        <NotImplemented value="variable name" />
      </span>
    </ScenarioRightPannel.Trigger>
  );
}

export const FormulaAggregation = {
  PannelContent: FormulaAggregationPannelContent,
  Trigger: FormulaAggregationTrigger,
};
