import { Callout } from '@app-builder/components/Callout';
import { cn } from 'ui-design-system';

type FieldProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  callout?: string;
  titleClassName?: string;
};

export const Field = ({ title, description, children, callout, titleClassName }: FieldProps) => {
  return (
    <div className="bg-white rounded-v2-lg border border-grey-border p-v2-md flex flex-col gap-v2-sm">
      <div className={cn('text-h2 font-semibold', titleClassName)}>{title}</div>
      <div className="text-grey-50">{description}</div>
      <div className="flex gap-v2-md items-center">{children}</div>
      {callout ? <Callout bordered>{callout}</Callout> : null}
    </div>
  );
};
