import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { Option } from './Option';

export function EditOption({ onSelect }: { onSelect: () => void }) {
  const { t } = useTranslation('common');

  return (
    <Option.Container onSelect={onSelect}>
      <div className="col-span-3 flex flex-row items-center justify-center gap-1 p-2">
        <Icon icon="edit" className="h-4 w-4" />
        <span className="text-grey-100 text-s font-semibold">{t('edit')}</span>
      </div>
    </Option.Container>
  );
}
