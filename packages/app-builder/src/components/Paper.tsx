import clsx from 'clsx';
import { Collapsible } from 'ui-design-system';

function PaperContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'border-grey-border w-full rounded-lg border',
        'flex flex-col gap-md p-md lg:gap-lg lg:p-lg',
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
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>) {
  return <p className={clsx('text-m text-grey-primary font-semibold', className)} {...props} />;
}

export const Paper = {
  Container: PaperContainer,
  Title: PaperTitle,
};

const CollapsiblePaperContainer = function CollapsiblePaperContainer({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Collapsible.Container> & { ref?: React.Ref<HTMLDivElement> }) {
  return <Collapsible.Container ref={ref} className={clsx('bg-surface-card', className)} {...props} />;
};

const CollapsiblePaperTitle = function CollapsiblePaperContainer({
  ref,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Collapsible.Title> & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <Collapsible.Title ref={ref} className="bg-surface-card" {...props}>
      <div
        className={clsx(
          'flex min-w-0 max-w-full flex-1 flex-row items-center gap-sm overflow-hidden text-start font-bold',
          className,
        )}
      >
        {children}
      </div>
    </Collapsible.Title>
  );
};

export const CollapsiblePaper = {
  Container: CollapsiblePaperContainer,
  Title: CollapsiblePaperTitle,
  Content: Collapsible.Content,
};
