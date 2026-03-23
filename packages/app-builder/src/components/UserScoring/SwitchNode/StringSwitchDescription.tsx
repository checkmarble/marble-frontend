import { type CustomList } from '@app-builder/models/custom-list';
import {
  type StringListOp,
  type StringOperation,
  type StringSingleValueOp,
  type StringSwitch,
} from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { SwitchCaseRow } from './shared';

interface StringSwitchDescriptionProps {
  conditions: StringSwitch;
  maxRiskLevel: number;
  customLists?: CustomList[];
}

function StringOperationValue({ operation, customLists }: { operation: StringOperation; customLists: CustomList[] }) {
  if (operation.op === 'IsInList' || operation.op === 'IsNotInList') {
    const listValue = operation.value;
    if (listValue.type === 'customList') {
      const list = customLists.find((l) => l.id === listValue.listId);
      return (
        <Tag color="grey" className="flex items-center gap-1">
          <Icon icon="list" className="size-3" />
          {list?.name ?? listValue.listId}
        </Tag>
      );
    }
    const MAX_VISIBLE = 3;
    const visible = listValue.values.slice(0, MAX_VISIBLE);
    const overflow = listValue.values.length - MAX_VISIBLE;
    return (
      <span className="flex flex-wrap items-center gap-1">
        {visible.map((v, i) => (
          <Tag key={i} color="grey">
            {v}
          </Tag>
        ))}
        {overflow > 0 && <Tag color="grey">+{overflow}</Tag>}
      </span>
    );
  }
  return <Tag color="grey">{operation.value as string}</Tag>;
}

export function StringSwitchDescription({ conditions, maxRiskLevel, customLists = [] }: StringSwitchDescriptionProps) {
  const { t } = useTranslation(['user-scoring']);

  const opLabels: Record<StringSingleValueOp | StringListOp, string> = {
    '=': t('user-scoring:switch.string.op.eq'),
    '≠': t('user-scoring:switch.string.op.neq'),
    StringContains: t('user-scoring:switch.string.op.contains'),
    StringNotContain: t('user-scoring:switch.string.op.not_contains'),
    StringStartsWith: t('user-scoring:switch.string.op.starts_with'),
    StringEndsWith: t('user-scoring:switch.string.op.ends_with'),
    IsInList: t('user-scoring:switch.string.op.in_list'),
    IsNotInList: t('user-scoring:switch.string.op.not_in_list'),
  };

  return (
    <ul className="flex flex-col gap-v2-sm">
      {conditions.branches.map((branch, idx) => (
        <SwitchCaseRow key={idx} impact={branch.impact} maxRiskLevel={maxRiskLevel}>
          <span className="flex items-center gap-v2-sm">
            {t('user-scoring:switch.description.if_value', { op: opLabels[branch.value.op] })}
            <StringOperationValue operation={branch.value} customLists={customLists} />
          </span>
        </SwitchCaseRow>
      ))}
      <SwitchCaseRow impact={conditions.default} maxRiskLevel={maxRiskLevel}>
        {t('user-scoring:switch.description.else')}
      </SwitchCaseRow>
    </ul>
  );
}
