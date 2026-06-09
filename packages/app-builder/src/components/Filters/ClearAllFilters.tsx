import { Link, type LinkProps as RemixLinkProps } from '@tanstack/react-router';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CtaV2ClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { filtersI18n } from './filters-i18n';

export const ClearAllFiltersLink = forwardRef<HTMLAnchorElement, Omit<RemixLinkProps, 'className' | 'ref'>>(
  function ClearAllFiltersButton(props, ref) {
    const { t } = useTranslation(filtersI18n);
    return (
      <Link
        data-test="clear-all-filters-link"
        className={CtaV2ClassName({ variant: 'secondary', color: 'grey', className: 'shrink-0' })}
        ref={ref}
        {...props}
      >
        <Icon icon="cross" className="size-5" />
        <span className="line-clamp-1">{t('filters:clear_filters')}</span>
      </Link>
    );
  },
);

export const ClearAllFiltersButton = forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'ref'>
>(function ClearAllFiltersButton(props, ref) {
  const { t } = useTranslation(filtersI18n);
  return (
    <button
      className={CtaV2ClassName({ variant: 'secondary', color: 'grey', className: 'shrink-0' })}
      ref={ref}
      {...props}
    >
      <Icon icon="cross" className="size-5" />
      <span className="line-clamp-1">{t('filters:clear_filters')}</span>
    </button>
  );
});
