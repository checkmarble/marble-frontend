import { clsx } from 'clsx';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, type ButtonProps } from 'ui-design-system';
import { Filters } from 'ui-icons';

import { filtersI18n } from './filters-i18n';

export const FiltersButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'ref'>
>(function FiltersButton({ className, ...props }, ref) {
  const { t } = useTranslation(filtersI18n);
  return (
    <Button
      className={clsx('flex flex-row gap-2', className)}
      variant="secondary"
      ref={ref}
      {...props}
    >
      <Filters className="text-l" />
      <span className="text-s font-semibold first-letter:capitalize">
        {t('filters:filters')}
      </span>
    </Button>
  );
});