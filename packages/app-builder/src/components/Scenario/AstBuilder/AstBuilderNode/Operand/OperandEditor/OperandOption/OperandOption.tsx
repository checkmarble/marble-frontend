import { Highlight } from '@app-builder/components/Highlight';
import { type LabelledAst } from '@app-builder/models';
import { Tip } from 'ui-icons';

import { OperandDescription, OperandTooltip } from '../../OperandTooltip';
import { getDataTypeIcon, Option } from './Option';

export function OperandOption({
  searchText = '',
  option,
  onSelect,
}: {
  searchText?: string;
  option: LabelledAst;
  onSelect: () => void;
}) {
  const DataTypeIcon = getDataTypeIcon(option.dataType);
  return (
    <Option.Container onSelect={onSelect} className="group">
      {DataTypeIcon ? (
        <Option.Icon className="col-start-1">
          <DataTypeIcon />
        </Option.Icon>
      ) : null}
      <Option.Value className="col-start-2">
        <Highlight text={option.name} query={searchText} />
      </Option.Value>
      <OperandTooltip
        content={
          <OperandDescription
            operand={{
              name: option.name,
              operandType: option.operandType,
              dataType: option.dataType,
              description: option.description,
              values: option.values,
            }}
          />
        }
        sideOffset={24}
        alignOffset={-8}
      >
        <Option.Icon className="group-radix-highlighted:text-purple-50 group-radix-highlighted:hover:text-purple-100 text-transparent">
          <Tip />
        </Option.Icon>
      </OperandTooltip>
    </Option.Container>
  );
}
