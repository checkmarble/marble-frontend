import { RestartAlt } from '@ui-icons';
import { useTranslation } from 'react-i18next';

import { Option } from './Option';

export function ClearOption({ onSelect }: { onSelect: () => void }) {
  const { t } = useTranslation('scenarios');

  return (
    <Option.Container onSelect={onSelect}>
      <div className="col-span-3 flex flex-row items-center justify-center gap-1 p-2">
        <RestartAlt className="text-m" />
        <span className="text-grey-100 text-s font-semibold">
          {t('edit_operand.clear_operand')}
        </span>
      </div>
    </Option.Container>
  );
}
