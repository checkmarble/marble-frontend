import { type LabelledAst } from '@app-builder/models';

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
    <Option.Container onClick={onClick}>
      {DataTypeIcon && (
        <Option.Icon className="col-start-1">
          <DataTypeIcon />
        </Option.Icon>
      )}
      <Option.Value className="col-start-2">{option.name}</Option.Value>
    </Option.Container>
  );
}
