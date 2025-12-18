import { ReactNode } from 'react';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

type ErrorComponentProps = {
  message: string;
};

export const ErrorComponent = ({ message }: ErrorComponentProps) => {
  return (
    <div className="p-md bg-red-95 border border-red-87 text-red-47 rounded-md flex items-center gap-lg">
      <Icon icon="error" className="size-10" />
      <p className="text-s">{message}</p>
    </div>
  );
};

export function QueryErrorComponent({
  error: _error,
  reset,
  children,
}: {
  error: any;
  reset: () => void;
  children: ReactNode;
}) {
  return (
    <div className="col-span-full p-lg flex flex-col gap-md items-center">
      {children}
      <Button variant="secondary" onClick={() => reset()}>
        Retry
      </Button>
    </div>
  );
}

export function makeQueryErrorComponent(message: ReactNode) {
  return (props: { error: any; reset: () => void }) => {
    return <QueryErrorComponent {...props} children={message} />;
  };
}
