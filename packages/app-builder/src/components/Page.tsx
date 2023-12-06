import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { ScrollArea } from 'ui-design-system';
import { ArrowLeft } from 'ui-icons';

function PageContainer({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <main
      className={clsx('flex flex-1 flex-col overflow-hidden', className)}
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

function PageHeader({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div
      className={clsx(
        'border-b-grey-10 bg-grey-00 text-l text-grey-100 flex shrink-0 flex-row items-center border-b px-4 font-bold lg:px-8',
        headerHeight({ type: 'height' }),
        className,
      )}
      {...props}
    />
  );
}

export type PageContentProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & { scrollable?: boolean };

function PageContent({
  className,
  scrollable = true,
  ...props
}: PageContentProps) {
  return scrollable ? (
    <ScrollArea.Root className="flex flex-1 flex-col">
      <ScrollArea.Viewport className="h-full">
        <div
          className={clsx(
            'flex flex-1 flex-col',
            'gap-4 p-4 lg:gap-8 lg:p-8',
            className,
          )}
          {...props}
        />
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar>
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  ) : (
    <div
      className={clsx(
        'flex flex-1 flex-col',
        'gap-4 p-4 lg:gap-8 lg:p-8',
        'overflow-auto',
        className,
      )}
      {...props}
    />
  );
}

function PageBackButton({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div
      className={clsx(
        'border-grey-10 flex items-center justify-center rounded-md border p-2',
        className,
      )}
      {...props}
    >
      <ArrowLeft />
    </div>
  );
}

export const Page = {
  Container: PageContainer,
  Header: PageHeader,
  BackButton: PageBackButton,
  Content: PageContent,
};
