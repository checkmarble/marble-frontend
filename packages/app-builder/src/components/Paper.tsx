import clsx from 'clsx';
import { ScrollArea } from 'ui-design-system';

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
        <div className="flex flex-col gap-4 p-4 lg:gap-8 lg:p-8">
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
        'flex flex-col gap-4 p-4 lg:gap-8 lg:p-8',
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
