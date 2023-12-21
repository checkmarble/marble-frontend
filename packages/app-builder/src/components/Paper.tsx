import clsx from 'clsx';
import { forwardRef } from 'react';
import { Collapsible, ScrollArea } from 'ui-design-system';

function PaperContainer({
  children,
  className,
  scrollable = true,
}: {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}) {
  return scrollable ? (
    <ScrollArea.Root
      className={clsx('border-grey-10 w-full rounded-lg border', className)}
      type="auto"
    >
      <ScrollArea.Viewport>
        <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  ) : (
    <div
      className={clsx(
        'border-grey-10 w-full rounded-lg border',
        'flex flex-col gap-4 p-4 lg:gap-6 lg:p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

function PaperTitle({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLParagraphElement>,
  HTMLParagraphElement
>) {
  return (
    <p
      className={clsx('text-m text-grey-100 font-semibold', className)}
      {...props}
    />
  );
}

export const Paper = {
  Container: PaperContainer,
  Title: PaperTitle,
};

const CollapsiblePaperContainer = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Collapsible.Container>
>(function CollapsiblePaperContainer({ className, ...props }, ref) {
  return (
    <Collapsible.Container
      ref={ref}
      className={clsx('bg-grey-00', className)}
      {...props}
    />
  );
});

const CollapsiblePaperTitle = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Collapsible.Title>
>(function CollapsiblePaperContainer({ className, children, ...props }, ref) {
  return (
    <Collapsible.Title ref={ref} className="bg-grey-02" {...props}>
      <div
        className={clsx(
          'flex flex-1 flex-row items-center gap-2 text-left font-bold capitalize',
          className,
        )}
      >
        {children}
      </div>
    </Collapsible.Title>
  );
});

export const CollapsiblePaper = {
  Container: CollapsiblePaperContainer,
  Title: CollapsiblePaperTitle,
  Content: Collapsible.Content,
};
