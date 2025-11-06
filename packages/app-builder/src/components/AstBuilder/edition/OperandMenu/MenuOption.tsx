import { Highlight } from '@app-builder/components/Highlight';
import { type AstNode, getDataTypeIcon, injectIdToNode } from '@app-builder/models';
import { OperandInfos } from '@ast-builder/OperandInfos';
import { type ReactNode } from 'react';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { type EnrichedMenuOption } from '../helpers';

type MenuOptionProps = {
  option: EnrichedMenuOption;
  value?: string;
  onSelect: (node: AstNode) => void;
  rightElement?: ReactNode;
  highlightSearch?: boolean;
};
export function MenuOption({ option, value, onSelect, rightElement, highlightSearch = true }: MenuOptionProps) {
  const searchValue = MenuCommand.State.useSharp().value.search;
  const leftIcon = option.icon ?? getDataTypeIcon(option.dataType);

  return (
    <MenuCommand.Item className="group" value={value} onSelect={() => onSelect(injectIdToNode(option.astNode))}>
      <div className="grid w-full grid-cols-[20px_1fr] gap-1">
        {leftIcon ? <Icon aria-hidden="true" className="col-start-1 size-5 shrink-0" icon={leftIcon} /> : null}
        <div className="col-start-2 flex flex-row gap-1 overflow-hidden">
          <div className="text-grey-00 text-s w-full break-all text-start font-normal">
            {searchValue && highlightSearch ? (
              <Highlight text={option.displayName} query={searchValue} />
            ) : (
              option.displayName
            )}
          </div>
          <div className="ml-auto shrink-0">
            {rightElement ?? (
              <OperandInfos
                // gutter={24}
                // shift={-8}
                node={option.astNode}
                dataType={option.dataType}
                operandType={option.operandType}
                displayName={option.displayName}
              />
            )}
          </div>
        </div>
      </div>
    </MenuCommand.Item>
  );
}
