import { Icon } from 'ui-icons';

export function CopyPivotValue({ children }: { children: React.ReactNode }) {
  return (
    <div className="group flex h-full cursor-pointer flex-row items-center gap-2">
      <span className="text-grey-50 group-hover:text-grey-100 select-none break-all text-xs font-normal transition-colors">
        {children}
      </span>
      <Icon
        icon="copy"
        className="group-hover:text-grey-100 size-4 shrink-0 text-transparent transition-colors"
      />
    </div>
  );
}
