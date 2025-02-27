import { matchSorter } from 'match-sorter';
import { useMemo } from 'react';
import { MenuCommand } from 'ui-design-system';

import { InternalOperandSharpFactory } from '../InternalOperand';
import { MenuOption } from './MenuOption';
import { type SmartMenuListProps } from './types';

export type SearchResultsProps = SmartMenuListProps & {
  search: string;
};
export function SearchResults({ onSelect, search }: SearchResultsProps) {
  const options = InternalOperandSharpFactory.useSharp().value.options;

  const matchOptions = useMemo(() => {
    return matchSorter(options, search, {
      keys: ['displayName', 'searchShortcut'],
    }).map(({ astNode, ...option }) => {
      return {
        key: `${option.displayName}-${option.dataType}-${option.operandType}`,
        ...option,
        astNode,
        onClick: () => {
          onSelect(astNode);
        },
      };
    });
  }, [onSelect, options, search]);

  return (
    <MenuCommand.List>
      <MenuCommand.Group heading={<ResultTitle />}>
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

function ResultTitle() {
  return 'Results';
}
