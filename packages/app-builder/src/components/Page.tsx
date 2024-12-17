import { Link, useNavigate } from '@remix-run/react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

function PageMain({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <main
      className={clsx(
        'bg-purple-02 flex flex-1 flex-col overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Used to set the height of the header and the margin-top of the toast
 *
 * They are heavilly linked together, thus the use of the same function
 */
export const headerHeight = cva(undefined, {
  variants: {
    type: {
      height: 'h-16 lg:h-20',
      mt: 'mt-16 lg:mt-20',
    },
  },
});

function PageHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'border-b-grey-10 bg-grey-00 text-l text-grey-100 flex shrink-0 flex-row items-center border-b px-4 font-bold lg:px-6',
        headerHeight({ type: 'height' }),
        className,
      )}
      {...props}
    />
  );
}

function PageContainer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className="scrollbar-gutter-stable size-full overflow-y-scroll"
      {...props}
    />
  );
}

function PageDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <aside
      className={clsx(
        'bg-purple-05 text-s flex flex-row gap-2 p-4 font-normal text-purple-100 lg:px-8 lg:py-4',
        className,
      )}
      {...props}
    >
      <Icon icon="tip" className="size-5 shrink-0" />
      {props.children}
    </aside>
  );
}

function PageContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'flex flex-1 flex-col gap-4 p-4 pe-[calc(1rem-var(--scrollbar-width))] lg:gap-8 lg:p-8 lg:pe-[calc(2rem-var(--scrollbar-width))]',
        className,
      )}
      {...props}
    />
  );
}

const pageBack = cva(
  'border-grey-10 hover:bg-grey-02 flex items-center justify-center rounded-md border p-2',
);

function PageBackButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  return (
    <Tooltip.Default content={t('common:go_back')}>
      <button
        className={pageBack({ className })}
        onClick={() => navigate(-1)}
        {...props}
      >
        <Icon icon="arrow-left" className="size-5 rtl:rotate-180" aria-hidden />
        <span className="sr-only">{t('common:go_back')}</span>
      </button>
    </Tooltip.Default>
  );
}

function PageBackLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link className={pageBack({ className })} {...props}>
      <Icon icon="arrow-left" className="size-5 rtl:rotate-180" aria-hidden />
    </Link>
  );
}

/**
 * Example:
 * ```tsx
 * <Page.Main>
 *     <Page.Header> // Fixed header
 *       ...
 *     </Page.Header>
 *     <Page.Container> // Scrollable container
 *         <Page.Description> // Optional
 *           ...
 *         </Page.Description>
 *         <Page.Content> // Main content of the page
 *           ...
 *         </Page.Content>
 *     </Page.Container>
 * </Page.Main>
 */
export const Page = {
  Main: PageMain,
  Header: PageHeader,
  BackButton: PageBackButton,
  BackLink: PageBackLink,
  Container: PageContainer,
  Content: PageContent,
  Description: PageDescription,
};
