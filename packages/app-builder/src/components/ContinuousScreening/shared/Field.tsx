import { Callout } from '@app-builder/components/Callout';
import { cn } from 'ui-design-system';

type FieldProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  callout?: string;
  titleClassName?: string;
  required?: boolean;
};

export const Field = ({ title, description, children, callout, titleClassName, required = false }: FieldProps) => {
  return (
    <div className="bg-surface-card rounded-lg border border-grey-border p-md flex flex-col gap-sm">
      <div className="flex items-center gap-xs">
        <span className={cn('text-h2 font-semibold', titleClassName)}>{title}</span>
        {required ? <span className="text-red-primary text-s">*</span> : null}
      </div>
      {description ? <div className="text-grey-secondary">{description}</div> : null}
      <div className="flex gap-md items-center">{children}</div>
      {callout ? <Callout bordered>{callout}</Callout> : null}
    </div>
  );
};
