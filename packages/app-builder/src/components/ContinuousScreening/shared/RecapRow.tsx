import { Tag } from 'ui-design-system';

export const RecapRow = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-row items-center gap-xs h-[25px]">{children}</div>;
};

export const RecapCapsule = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tag
      color="grey"
      className="bg-grey-background [.group\/recap-valid_&]:bg-surface-card [.group\/recap-valid_&]:dark:border [.group\/recap-valid_&]:dark:border-green-primary"
    >
      {children}
    </Tag>
  );
};
