import { type DataType, type LabelledAst } from '@app-builder/models';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import { getDataTypeIcon, Option } from './Option';

export function ConstantOption({
  constant,
  onSelect,
}: {
  constant: LabelledAst;
  onSelect: () => void;
}) {
  const { t } = useTranslation('scenarios');
  const dataTypeIcon = getDataTypeIcon(constant.dataType);
  const constantDataTypeTKey = getConstantDataTypeTKey(constant.dataType);

  return (
    <Option.Container onSelect={onSelect}>
      {dataTypeIcon ? (
        <Option.Icon className="col-start-1" icon={dataTypeIcon} />
      ) : null}
      <div className="col-span-2 col-start-2 flex justify-between gap-1">
        <Option.Value className="line-clamp-1 text-ellipsis">
          {constant.name}
        </Option.Value>
        {constantDataTypeTKey ? (
          <span className="text-s shrink-0 font-semibold text-purple-100">
            {t(constantDataTypeTKey)}
          </span>
        ) : null}
      </div>
    </Option.Container>
  );
}

export function getConstantDataTypeTKey(
  dataType?: DataType,
): ParseKeys<'scenarios'> | undefined {
  switch (dataType) {
    case 'String':
      return 'edit_operand.constant.use_data_type.string';
    case 'Int':
    case 'Float':
      return 'edit_operand.constant.use_data_type.number';
    case 'Bool':
      return 'edit_operand.constant.use_data_type.boolean';
    case 'String[]':
      return 'edit_operand.constant.use_data_type.string[]';
    case 'Int[]':
    case 'Float[]':
      return 'edit_operand.constant.use_data_type.number[]';
    case 'Bool[]':
      return 'edit_operand.constant.use_data_type.boolean[]';
    default:
      return undefined;
  }
}
