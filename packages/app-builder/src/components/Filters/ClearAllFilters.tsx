import { TranslationObject } from '@app-builder/types/i18n';
import { Link } from '@remix-run/react';
import { type RemixLinkProps } from '@remix-run/react/dist/components';
import { clsx } from 'clsx';
import { forwardRef } from 'react';
import { CtaClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const ClearAllFiltersLink = forwardRef<
  HTMLAnchorElement,
  Omit<RemixLinkProps, 'className' | 'ref'> & { translationObject: TranslationObject<['filters']> }
>(function ClearAllFiltersButton(props, ref) {
  const { translationObject, ...linkProps } = props;
  const { tFilters } = translationObject;
  return (
    <Link
      className={clsx(CtaClassName({ variant: 'tertiary', color: 'grey' }), 'shrink-0')}
      ref={ref}
      {...linkProps}
    >
      <Icon icon="cross" className="size-5" />
      <span className="line-clamp-1 capitalize">{tFilters('clear_filters')}</span>
    </Link>
  );
});

export const ClearAllFiltersButton = forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'ref'> & {
    translationObject: TranslationObject<['filters']>;
  }
>(function ClearAllFiltersButton(props, ref) {
  const { translationObject, ...buttonProps } = props;
  const { tFilters } = translationObject;
  return (
    <button
      className={clsx(CtaClassName({ variant: 'tertiary', color: 'grey' }), 'shrink-0')}
      ref={ref}
      {...buttonProps}
    >
      <Icon icon="cross" className="size-5" />
      <span className="line-clamp-1 capitalize">{tFilters('clear_filters')}</span>
    </button>
  );
});
