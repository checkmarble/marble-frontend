import { type DataType, type LabelledAst } from '@app-builder/models';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import { getDataTypeIcon, Option } from './Option';

export function ConstantOption({
  constant,
  onClick,
}: {
  constant: LabelledAst;
  onClick: () => void;
}) {
  const { t } = useTranslation('scenarios');
  const DataTypeIcon = getDataTypeIcon(constant.dataType);
  const constantDataTypeTKey = getConstantDataTypeTKey(constant.dataType);

  return (
    <Option.Container onClick={onClick}>
      {DataTypeIcon && (
        <Option.Icon className="col-start-1">
          <DataTypeIcon />
        </Option.Icon>
      )}
      <div className="col-span-2 col-start-2 flex items-center justify-between gap-1">
        <Option.Value className="overflow-hidden text-ellipsis">
          {constant.name}
        </Option.Value>
        {constantDataTypeTKey && (
          <span className="text-s shrink-0 font-semibold text-purple-100">
            {t(constantDataTypeTKey)}
          </span>
        )}
      </div>
    </Option.Container>
  );
}

export function getConstantDataTypeTKey(
  dataType?: DataType
): ParseKeys<'scenarios'> | undefined {
  switch (dataType) {
    case 'String':
      return 'edit_operand.constant.use_data_type.string';
    case 'Int':
    case 'Float':
      return 'edit_operand.constant.use_data_type.number';
    case 'Bool':
      return 'edit_operand.constant.use_data_type.boolean';
    default:
      return undefined;
  }
}
