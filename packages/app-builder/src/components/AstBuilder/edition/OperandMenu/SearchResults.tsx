import { matchSorter } from 'match-sorter';
import { MenuCommand } from 'ui-design-system';

import { InternalOperandState } from '../InternalOperand';
import { type SmartMenuListProps } from './types';

export type SearchResultsProps = SmartMenuListProps & {
  search: string;
};
export function SearchResults({ onSelect, search }: SearchResultsProps) {
  // const options = InternalOperandState.useStore(s => s.options);

  // const matchOptions = React.useMemo(() => {
  //   return matchSorter(options, search, {
  //     keys: ['displayName', 'searchShortcut'],
  //   }).map(({ astNode, ...option }) => {
  //     return {
  //       key: `${option.displayName}-${option.dataType}-${option.operandType}`,
  //       ...option,
  //       astNode,
  //       onClick: () => {
  //         onSelect(astNode);
  //       },
  //     };
  //   });
  // }, [onSelect, options, search, initialAstNode]);

  return (
    <MenuCommand.List>
      <MenuCommand.Group heading={<ResultTitle />}></MenuCommand.Group>
    </MenuCommand.List>
  );
}

function ResultTitle() {
  return 'Results';
}
