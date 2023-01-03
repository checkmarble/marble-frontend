import clsx from 'clsx';
import React from 'react';

function PaperContainer({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div
      className={clsx(
        'border-grey-10 flex w-fit max-w-3xl flex-col rounded-lg border',
        'gap-4 p-4 lg:gap-8 lg:p-8',
        className
      )}
      {...props}
    />
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
      className={clsx('text-text-m-semibold text-grey-100', className)}
      {...props}
    />
  );
}

export const Paper = {
  Container: PaperContainer,
  Title: PaperTitle,
};
