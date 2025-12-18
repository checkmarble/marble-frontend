import { cn } from 'ui-design-system';

export const tabClassName = cn(
  'flex items-center h-8 px-v2-sm text-s font-medium rounded-v2-md',
  'data-[status=active]:bg-purple-primary data-[status=active]:text-white data-[status=active]:dark:bg-purple-primary data-[status=active]:dark:text-grey-white',
  'bg-purple-background text-purple-primary dark:bg-transparent dark:text-grey-placeholder',
);

export const Tabs = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex p-v2-xs gap-v2-xs rounded-v2-lg bg-purple-background self-start justify-self-start dark:bg-grey-background">
      {children}
    </div>
  );
};
