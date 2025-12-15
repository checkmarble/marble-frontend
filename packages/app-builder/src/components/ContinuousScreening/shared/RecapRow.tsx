import { Capsule } from './Capsule';

export const RecapRow = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-row items-center gap-v2-xs h-[25px]">{children}</div>;
};

export const RecapCapsule = ({ children }: { children: React.ReactNode }) => {
  return <Capsule className="bg-grey-background [.group\/recap-valid_&]:bg-white">{children}</Capsule>;
};
