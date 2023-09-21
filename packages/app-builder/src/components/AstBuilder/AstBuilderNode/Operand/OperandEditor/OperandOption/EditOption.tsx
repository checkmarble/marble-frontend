import { Edit } from '@ui-icons';
import { useTranslation } from 'react-i18next';

import { Option } from './Option';

export function EditOption({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('common');

  return (
    <Option.Container onClick={onClick}>
      <div className="col-span-3 flex flex-row items-center justify-center gap-1 p-2">
        <Edit className="text-m" />
        <span className="text-grey-100 text-s font-semibold">{t('edit')}</span>
      </div>
    </Option.Container>
  );
}
