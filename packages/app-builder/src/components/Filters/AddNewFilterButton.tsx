import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, type ButtonProps } from 'ui-design-system';
import { Plus } from 'ui-icons';

import { filtersI18n } from './filters-i18n';

export const AddNewFilterButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'ref'>
>(function AddNewFilterButton(props, ref) {
  const { t } = useTranslation(filtersI18n);
  return (
    <Button variant="tertiary" ref={ref} {...props}>
      <Plus className="text-l" />
      <span className="line-clamp-1 capitalize">{t('filters:new_filter')}</span>
    </Button>
  );
});
