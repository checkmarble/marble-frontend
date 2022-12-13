import clsx from 'clsx';

function PageContainer({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return <div className={clsx('flex flex-1 flex-col', className)} {...props} />;
}

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
        'border-b-grey-10 bg-grey-00 text-display-l-bold text-grey-100 sticky top-0 flex h-20 flex-row items-center border-b pr-8 pl-8',
        className
      )}
      {...props}
    />
  );
}

function PageContent({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div className={clsx('flex flex-1 flex-col p-8', className)} {...props} />
  );
}

export const Page = {
  Container: PageContainer,
  Header: PageHeader,
  Content: PageContent,
};
