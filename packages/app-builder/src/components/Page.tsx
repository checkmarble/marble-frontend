import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { Link } from '@tanstack/react-router';
import { cva, VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CtaV2ClassName, cn, StickyComponent, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

function PageMain({ className, ...props }: React.ComponentProps<'div'>) {
  return <main className={cn('relative bg-surface-page flex flex-1 flex-col', className)} {...props} />;
}

function PageHeader({ className, children, color, ...props }: React.ComponentProps<'div'>) {
  return (
    <StickyComponent sentinelClassName="top-0">
      <div
        className={cn(
          'sticky top-0 z-1 h-12 text-l flex shrink-0 flex-row items-center font-semibold px-md bg-surface-page border-y border-transparent sentinel-intersect:border-b-grey-border sentinel-intersect:shadow-sticky-top',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </StickyComponent>
  );
}

const PageContainer = forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(function PageContainer(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn('flex min-w-0 flex-1 flex-col', className)} {...props}>
      {children}
    </div>
  );
});

const pageDescriptionClassName = cva(
  'bg-grey-white text-s text-grey-secondary flex flex-row gap-sm p-md font-normal border-grey-border dark:bg-grey-background',
  {
    variants: {
      headerBanner: {
        true: 'border-b',
        false: 'border rounded-md ',
      },
    },
    defaultVariants: {
      headerBanner: false,
    },
  },
);

function PageDescription({
  className,
  withIcon = true,
  headerBanner = false,
  ...props
}: React.ComponentProps<'aside'> & { withIcon?: boolean; headerBanner?: boolean }) {
  return (
    <aside className={cn(pageDescriptionClassName({ headerBanner }), className)} {...props}>
      {withIcon ? <Icon icon="tip" className="size-5 shrink-0" /> : null}
      {props.children}
    </aside>
  );
}

// @deprecated
function PageContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col gap-md p-md pe-[calc(1rem-var(--scrollbar-width))] lg:gap-xl lg:p-xl lg:pe-[calc(2rem-var(--scrollbar-width))]',
        className,
      )}
      {...props}
    />
  );
}

const PageContentV2ClassName = cva('flex flex-1 flex-col text-default', {
  variants: {
    padding: {
      default: 'p-md md:p-lg lg:px-2xl lg:py-lg',
      compact: 'p-md',
      none: 'p-0',
    },
    width: {
      fluid: null,
      readable: 'mx-auto w-full max-w-(--breakpoint-xl)',
      form: 'mx-auto w-full max-w-(--breakpoint-lg)',
      table: 'min-w-0 w-full',
    },
    centered: {
      true: 'mx-auto',
      false: null,
    },
  },
  defaultVariants: {
    padding: 'default',
    width: 'fluid',
    centered: false,
  },
});

type PageContentV2Props = React.ComponentProps<'div'> &
  Omit<VariantProps<typeof PageContentV2ClassName>, 'padding'> & {
    /** @deprecated Use `padding="none"` instead. */
    paddingLess?: boolean;
    padding?: VariantProps<typeof PageContentV2ClassName>['padding'];
  };

function PageContentV2({ className, centered, paddingLess, padding, width, ...props }: PageContentV2Props) {
  const resolvedPadding = paddingLess === true ? 'none' : padding;

  return (
    <div className={PageContentV2ClassName({ centered, padding: resolvedPadding, width, className })} {...props} />
  );
}

const pageBack = cva(
  'border-grey-border hover:bg-grey-background-light flex items-center justify-center rounded-md border p-sm dark:border-grey-border dark:hover:bg-grey-background',
);

function PageBackButton({ className, ...props }: React.ComponentProps<'button'>) {
  const navigate = useAgnosticNavigation();
  const { t } = useTranslation(['common']);
  return (
    <Tooltip.Default content={t('common:go_back')}>
      <button className={pageBack({ className })} onClick={() => navigate(-1)} {...props}>
        <Icon icon="arrow-left" className="size-5 rtl:rotate-180" aria-hidden />
        <span className="sr-only">{t('common:go_back')}</span>
      </button>
    </Tooltip.Default>
  );
}

function PageBackLink({ className: _className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link className={CtaV2ClassName({ variant: 'secondary', appearance: 'stroked', mode: 'icon' })} {...props}>
      <Icon icon="arrow-left" className="size-4 rtl:rotate-180" aria-hidden />
    </Link>
  );
}

/**
 * Example:
 * ```tsx
 * <Page.Main>
 *     <Page.Header> // Sticky header
 *       ...
 *     </Page.Header>
 *     <Page.Container> // Content region below the sticky header
 *         <Page.Description> // Optional
 *           ...
 *         </Page.Description>
 *         <Page.ContentV2 padding="default" width="readable"> // Main content
 *           ...
 *         </Page.ContentV2>
 *     </Page.Container>
 * </Page.Main>
 * ```
 *
 * `Page.ContentV2` layout variants:
 * - `padding`: `default` (responsive md/lg/2xl gutters), `compact` (md), `none`
 * - `width`: `fluid`, `readable` (xl max-width), `form` (lg max-width), `table` (full-width tables)
 * - `paddingLess` is deprecated; use `padding="none"` instead.
 */
export const Page = {
  Main: PageMain,
  Header: PageHeader,
  BackButton: PageBackButton,
  BackLink: PageBackLink,
  Container: PageContainer,
  Content: PageContent,
  ContentV2: PageContentV2,
  Description: PageDescription,
};
