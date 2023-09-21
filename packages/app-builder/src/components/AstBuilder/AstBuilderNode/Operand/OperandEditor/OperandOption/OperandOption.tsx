import { type LabelledAst } from '@app-builder/models';
import { adaptHighlightedParts } from '@app-builder/utils/search';
import { Tip } from '@ui-icons';
import { Fragment } from 'react';

import { OperandTooltip } from '../../OperandTooltip';
import { getDataTypeIcon, Option } from './Option';

export function OperandOption({
  searchText,
  option,
  onClick,
}: {
  searchText: string;
  option: LabelledAst;
  onClick: () => void;
}) {
  const DataTypeIcon = getDataTypeIcon(option.dataType);
  const parts = adaptHighlightedParts(option.name, searchText);
  return (
    <Option.Container onClick={onClick} className="group">
      {DataTypeIcon && (
        <Option.Icon className="col-start-1">
          <DataTypeIcon />
        </Option.Icon>
      )}
      <Option.Value className="col-start-2">
        {parts.map((part, index) =>
          part.highlight ? (
            <mark
              key={index}
              className="bg-transparent font-semibold text-purple-100"
            >
              {part.text}
            </mark>
          ) : (
            <Fragment key={index}>{part.text}</Fragment>
          )
        )}
      </Option.Value>
      <OperandTooltip
        operand={{
          name: option.name,
          operandType: option.operandType,
          dataType: option.dataType,
          description: option.description,
        }}
        sideOffset={24}
        alignOffset={-8}
      >
        <Option.Icon className="text-transparent group-hover:text-purple-50 group-hover:hover:text-purple-100">
          <Tip />
        </Option.Icon>
      </OperandTooltip>
    </Option.Container>
  );
}
