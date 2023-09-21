import { type LabelledAst } from '@app-builder/models';
import { Tip } from '@ui-icons';

import { OperandTooltip } from './OperandTooltip';
import { getDataTypeIcon, Option } from './Option';

export function OperandOption({
  option,
  onClick,
}: {
  option: LabelledAst;
  onClick: () => void;
}) {
  const DataTypeIcon = getDataTypeIcon(option.dataType);
  return (
    <Option.Container onClick={onClick} className="group">
      {DataTypeIcon && (
        <Option.Icon className="col-start-1">
          <DataTypeIcon />
        </Option.Icon>
      )}
      <Option.Value className="col-start-2">{option.name}</Option.Value>
      <OperandTooltip option={option} sideOffset={24} alignOffset={-8}>
        <Option.Icon className="text-grey-00 group-hover:text-purple-50 group-hover:hover:text-purple-100">
          <Tip />
        </Option.Icon>
      </OperandTooltip>
    </Option.Container>
  );
}
