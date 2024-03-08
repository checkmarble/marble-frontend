import { type LabelledAst } from '@app-builder/models';
import * as Ariakit from '@ariakit/react';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import {
  getDataTypeIcon,
  getDataTypeTKey,
  getOperatorTypeIcon,
  getOperatorTypeTKey,
} from './utils';

const MAX_ENUM_VALUES = 50;

interface OperandInfosProps {
  children: React.ReactNode;
  className?: string;
  gutter?: number;
  shift?: number;
}

export function OperandInfos({
  children,
  className,
  gutter,
  shift,
}: OperandInfosProps) {
  return (
    <Ariakit.HovercardProvider
      showTimeout={0}
      hideTimeout={0}
      placement="right-start"
    >
      <Ariakit.HovercardAnchor tabIndex={-1}>
        <Icon icon="tip" className={className} />
      </Ariakit.HovercardAnchor>
      <Ariakit.Hovercard
        gutter={gutter}
        shift={shift}
        portal
        className="bg-grey-00 border-grey-10 flex max-h-[400px] overflow-y-auto overflow-x-hidden rounded border shadow-md"
      >
        <div className="flex flex-col gap-2 p-4">{children}</div>
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  );
}

//TODO: change for a polymorphic option with a conditional render on the type
export const OperandDescription = ({ option }: { option: LabelledAst }) => {
  const { t } = useTranslation(['scenarios']);

  const values = useMemo(() => {
    if (!option.values) return null;
    const sorted = [...option.values].sort();
    if (sorted.length > MAX_ENUM_VALUES) {
      const sliced = sorted.slice(0, MAX_ENUM_VALUES);
      sliced.push('...');
      return sliced;
    }
    return sorted;
  }, [option.values]);

  return (
    <Fragment>
      <div className="flex flex-col gap-1">
        <TypeInfos
          operandType={option.operandType}
          dataType={option.dataType}
        />
        <p className="text-grey-100 text-s text-ellipsis hyphens-auto font-normal">
          {option.name}
        </p>
      </div>
      {option.description ? (
        <p className="text-grey-50 max-w-[300px] text-xs font-normal first-letter:capitalize">
          {option.description}
        </p>
      ) : null}
      {values && values.length > 0 ? (
        <div className="flex max-w-[300px] flex-col gap-1">
          <p className="text-grey-50 text-s">{t('scenarios:enum_options')}</p>
          <ul className="flex flex-col">
            {values.map((value) => {
              return (
                <li
                  key={value}
                  className="text-grey-50 truncate text-xs font-normal"
                >
                  {value}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </Fragment>
  );
};

function TypeInfos({
  operandType,
  dataType,
}: {
  operandType: LabelledAst['operandType'];
  dataType: LabelledAst['dataType'];
}) {
  const { t } = useTranslation(['scenarios']);
  const typeInfos = [
    {
      icon: getOperatorTypeIcon(operandType),
      tKey: getOperatorTypeTKey(operandType),
    },
    {
      icon: getDataTypeIcon(dataType),
      tKey: getDataTypeTKey(dataType),
    },
  ];
  if (typeInfos.filter(({ tKey }) => !!tKey).length === 0) return null;

  return (
    <div className="flex flex-row gap-2">
      {typeInfos.map(({ icon, tKey }) => {
        if (!tKey) return null;
        return (
          <span
            key={tKey}
            className="inline-flex items-center gap-[2px] text-xs font-normal text-purple-50"
          >
            {icon ? <Icon icon={icon} className="size-3" /> : null}
            {t(tKey, { count: 1 })}
          </span>
        );
      })}
    </div>
  );
}
