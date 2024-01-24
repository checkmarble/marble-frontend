import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { ScrollAreaV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

function PageContainer({ className, ...props }: React.ComponentProps<'div'>) {
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

function PageContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <ScrollAreaV2 className="size-full" type="auto">
      <div
        className={clsx(
          'flex flex-1 flex-col',
          'gap-4 p-4 lg:gap-6 lg:p-6',
          className,
        )}
        {...props}
      />
    </ScrollAreaV2>
  );
}

function PageBackButton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'border-grey-10 flex items-center justify-center rounded-md border p-2',
        className,
      )}
      {...props}
    >
      <Icon icon="arrow-left" className="size-5" />
    </div>
  );
}

export const Page = {
  Container: PageContainer,
  Header: PageHeader,
  BackButton: PageBackButton,
  Content: PageContent,
};
