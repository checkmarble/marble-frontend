import { getConstantDataTypeTKey, injectIdToNode } from '@app-builder/models';
import { formatConstant } from '@app-builder/services/ast-node/formatConstant';
import { getConstantAstNodeDataType } from '@app-builder/services/ast-node/getAstNodeDataType';
import { useFormatLanguage } from '@app-builder/utils/format';
import { matchSorter } from 'match-sorter';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';

import { coerceToConstantAstNode } from '../coerceToConstantAstNode';
import { EditionOperandSharpFactory } from '../EditionOperand';
import { MenuOption } from './MenuOption';
import { type SmartMenuListProps } from './types';

export type SearchResultsProps = SmartMenuListProps & {
  search: string;
};
export function SearchResults({ onSelect, search }: SearchResultsProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const options = EditionOperandSharpFactory.useSharp().computed.filteredOptions.value;
  const coerceDataType = EditionOperandSharpFactory.select((s) => s.coerceDataType);

  const matchOptions = useMemo(() => {
    return matchSorter(options, search, {
      keys: ['displayName', 'searchShortcut'],
    }).map(({ astNode, ...option }) => {
      return {
        key: `${option.displayName}-${option.dataType}-${option.operandType}`,
        ...option,
        astNode,
        onClick: () => {
          onSelect(injectIdToNode(astNode));
        },
      };
    });
  }, [onSelect, options, search]);

  const coercedOptions = useMemo(() => {
    const coerceOpts = coerceToConstantAstNode(search, {
      booleans: {
        true: ['true', t('common:true')],
        false: ['false', t('common:false')],
      },
    }).map(
      (node) =>
        ({
          astNode: node,
          displayName: formatConstant(node.constant, { t, language }),
          operandType: 'Constant',
          dataType: getConstantAstNodeDataType(node),
        }) as const,
    );

    return coerceDataType ? coerceOpts.filter((o) => coerceDataType.includes(o.dataType)) : coerceOpts;
  }, [t, language, search, coerceDataType]);

  return (
    <MenuCommand.List>
      {coercedOptions.length > 0 ? (
        <MenuCommand.Group forceMount>
          {coercedOptions.map((option) => {
            const dataTypeTkey = getConstantDataTypeTKey(option.dataType);
            return (
              <MenuOption
                highlightSearch={false}
                value={`${option.displayName}-${option.dataType}`}
                key={`${option.displayName}-${option.dataType}-${option.operandType}`}
                option={option}
                onSelect={onSelect}
                rightElement={
                  dataTypeTkey ? (
                    <span className="text-s text-purple-65 font-semibold">{t(`scenarios:${dataTypeTkey}`)}</span>
                  ) : undefined
                }
              />
            );
          })}
        </MenuCommand.Group>
      ) : null}
      <MenuCommand.Group forceMount heading={<ResultTitle count={matchOptions.length} />}>
        {matchOptions.map((option) => (
          <MenuOption
            key={`${option.displayName}-${option.dataType}-${option.operandType}`}
            option={option}
            onSelect={onSelect}
          />
        ))}
      </MenuCommand.Group>
    </MenuCommand.List>
  );
}

function ResultTitle({ count }: { count: number }) {
  return (
    <div className="flex min-h-10 select-none flex-row items-center gap-1 p-2">
      <div className="flex w-full items-baseline gap-1">
        <div className="text-grey-00 text-m flex items-baseline whitespace-pre font-semibold">Results</div>
        <div className="text-grey-80 text-xs font-medium">{count}</div>
      </div>
    </div>
  );
}
