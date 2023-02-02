import { ScrollArea } from '@marble-front/ui/design-system';
import clsx from 'clsx';
import React from 'react';

function PaperContainer({ children }: { children: React.ReactNode }) {
  return (
    <ScrollArea.Root
      className="border-grey-10 max-w-3xl rounded-lg border"
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
