import { Highlight } from '@app-builder/components/Highlight';
import { type AstNode, findDataModelTableByName, getDataTypeIcon } from '@app-builder/models';
import { getAstNodeDataType } from '@app-builder/services/ast-node/getAstNodeDataType';
import { getAstNodeDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { useFormatLanguage } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { AstBuilderDataSharpFactory } from '../../Provider';
import { type EnrichedMenuOption } from '../helpers';

export function MenuOption({
  option,
  onSelect,
}: {
  option: EnrichedMenuOption;
  onSelect: (node: AstNode) => void;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const data = AstBuilderDataSharpFactory.useSharp().value.$data!.value;
  const searchValue = MenuCommand.State.useSharp().value.search;

  const triggerObjectTable = findDataModelTableByName({
    dataModel: data.dataModel,
    tableName: data.triggerObjectType,
  });

  const displayName =
    option.displayName ??
    getAstNodeDisplayName(option.astNode, {
      customLists: data.customLists,
      t,
      language,
    });
  const dataType =
    option.dataType ??
    getAstNodeDataType(option.astNode, {
      triggerObjectTable,
      dataModel: data.dataModel,
    });
  const leftIcon = option.icon ?? getDataTypeIcon(dataType);

  return (
    <MenuCommand.Item onSelect={() => onSelect(option.astNode)}>
      <div className="grid w-full grid-cols-[20px_1fr] gap-1">
        {leftIcon ? (
          <Icon aria-hidden="true" className="col-start-1 size-5 shrink-0" icon={leftIcon} />
        ) : null}
        <div className="col-start-2 flex flex-row gap-1 overflow-hidden">
          <div className="text-grey-00 text-s w-full break-all text-start font-normal">
            {searchValue ? <Highlight text={displayName} query={searchValue} /> : displayName}
          </div>
          {/* <OperandInfos
            gutter={24}
            shift={-8}
            className="group-hover:hover:text-purple-65 group-hover:text-purple-82 size-5 shrink-0 text-transparent"
            astNode={option.astNode}
            dataType={dataType}
            operandType={option.operandType}
            displayName={displayName}
          /> */}
        </div>
      </div>
    </MenuCommand.Item>
  );
}
