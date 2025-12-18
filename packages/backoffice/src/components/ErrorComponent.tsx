import { Icon } from 'ui-icons';

type ErrorComponentProps = {
  message: string;
};

export const ErrorComponent = ({ message }: ErrorComponentProps) => {
  return (
    <div className="p-v2-md bg-red-95 border border-red-87 text-red-47 rounded-v2-md flex items-center gap-v2-lg">
      <Icon icon="error" className="size-10" />
      <p className="text-s">{message}</p>
    </div>
  );
};
