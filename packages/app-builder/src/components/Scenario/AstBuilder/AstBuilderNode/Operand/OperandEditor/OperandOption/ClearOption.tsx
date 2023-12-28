import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { Option } from './Option';

export function ClearOption({ onSelect }: { onSelect: () => void }) {
  const { t } = useTranslation('scenarios');

  return (
    <Option.Container onSelect={onSelect}>
      <div className="col-span-3 flex flex-row items-center justify-center gap-1 p-2">
        <Icon icon="restart-alt" className="h-4 w-4" />
        <span className="text-grey-100 text-s font-semibold">
          {t('edit_operand.clear_operand')}
        </span>
      </div>
    </Option.Container>
  );
}
