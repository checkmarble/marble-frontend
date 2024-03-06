import { Highlight } from '@app-builder/components/Highlight';
import { type LabelledAst } from '@app-builder/models';

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
  const dataTypeIcon = getDataTypeIcon(option.dataType);
  return (
    <Option.Container onClick={onSelect} className="group">
      {dataTypeIcon ? (
        <Option.Icon className="col-start-1" icon={dataTypeIcon} />
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
        <Option.Icon
          className="text-transparent group-data-[active-item]:text-purple-50 group-data-[active-item]:hover:text-purple-100"
          icon="tip"
        />
      </OperandTooltip>
    </Option.Container>
  );
}
