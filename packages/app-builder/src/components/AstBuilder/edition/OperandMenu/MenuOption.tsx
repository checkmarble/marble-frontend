import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { Highlight } from '@app-builder/components/Highlight';
import { Nudge } from '@app-builder/components/Nudge';
import { type AstNode, getDataTypeIcon, injectIdToNode } from '@app-builder/models';
import { isAggregation } from '@app-builder/models/astNode/aggregation';
import { isRestrictedAggregator } from '@app-builder/models/modale-operators';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { OperandInfos } from '../../OperandInfos';
import { type EnrichedMenuOption } from '../helpers';

type MenuOptionProps = {
  option: EnrichedMenuOption;
  value?: string;
  onSelect: (node: AstNode) => void;
  rightElement?: ReactNode;
  highlightSearch?: boolean;
};
export function MenuOption({ option, value, onSelect, rightElement, highlightSearch = true }: MenuOptionProps) {
  const { t } = useTranslation(['common']);
  const searchValue = MenuCommand.State.useSharp().value.search;
  const leftIcon = option.icon ?? getDataTypeIcon(option.dataType);
  const workflowsAccess = AstBuilderDataSharpFactory.select((s) => s.data.workflowsAccess);

  // Check if this is a restricted aggregator option
  const isRestrictedOption =
    isAggregation(option.astNode) && isRestrictedAggregator(option.astNode.namedChildren.aggregator.constant);
  const isRestricted = workflowsAccess !== undefined && workflowsAccess !== 'allowed';
  const isDisabled = isRestrictedOption && isRestricted;
  const showNudge = isRestrictedOption && isRestricted;

  return (
    <MenuCommand.Item
      className="group"
      value={value}
      onSelect={() => onSelect(injectIdToNode(option.astNode))}
      disabled={isDisabled}
    >
      <div className="grid w-full grid-cols-[20px_1fr] gap-1">
        {leftIcon ? <Icon aria-hidden="true" className="col-start-1 size-5 shrink-0" icon={leftIcon} /> : null}
        <div className="col-start-2 flex flex-row gap-1 overflow-hidden">
          <div className="text-grey-primary text-s w-full break-all text-start font-normal">
            {searchValue && highlightSearch ? (
              <Highlight text={option.displayName} query={searchValue} />
            ) : (
              option.displayName
            )}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            {rightElement ?? (
              <OperandInfos
                node={option.astNode}
                dataType={option.dataType}
                operandType={option.operandType}
                displayName={option.displayName}
              />
            )}
            {showNudge && workflowsAccess ? (
              <Nudge kind={workflowsAccess} content={t('common:premium')} className="size-5" />
            ) : null}
          </div>
        </div>
      </div>
    </MenuCommand.Item>
  );
}
