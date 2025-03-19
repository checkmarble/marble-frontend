import { undefinedAstNodeName } from '@app-builder/models';
import { getOperatorName } from '@app-builder/models/get-operator-name';
import { useTranslation } from 'react-i18next';

export function ViewingOperator({
  operator,
  isFilter = false,
}: {
  operator: string | null;
  isFilter?: boolean;
}) {
  const { t } = useTranslation(['common', 'scenarios']);

  const _value = operator !== undefinedAstNodeName && operator !== null ? operator : null;
  return (
    <div className="bg-grey-98 flex h-10 min-w-[40px] items-center justify-between gap-2 rounded px-2 outline-none">
      <span className="text-s text-grey-00 w-full text-center font-medium">
        {_value ? getOperatorName(t, _value, isFilter) : '...'}
      </span>
    </div>
  );
}
