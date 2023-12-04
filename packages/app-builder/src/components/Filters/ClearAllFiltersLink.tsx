import { Link } from '@remix-run/react';
import { type RemixLinkProps } from '@remix-run/react/dist/components';
import { clsx } from 'clsx';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CtaClassName } from 'ui-design-system';
import { Cross } from 'ui-icons';

import { filtersI18n } from './filters-i18n';

export const ClearAllFiltersLink = forwardRef<
  HTMLAnchorElement,
  Omit<RemixLinkProps, 'className' | 'ref'>
>(function ClearAllFiltersButton(props, ref) {
  const { t } = useTranslation(filtersI18n);
  return (
    <Link
      className={clsx(
        CtaClassName({ variant: 'tertiary', color: 'grey' }),
        'shrink-0',
      )}
      ref={ref}
      {...props}
    >
      <Cross className="text-l" />
      <span className="line-clamp-1 capitalize">
        {t('filters:clear_filters')}
      </span>
    </Link>
  );
});
