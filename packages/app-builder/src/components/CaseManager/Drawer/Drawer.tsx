import { createSimpleContext } from '@marble/shared';
import { cva } from 'class-variance-authority';
import { type Dispatch, Fragment, type ReactNode, type SetStateAction, useState } from 'react';

import { DrawerIcon } from './DrawerIcon';

export const DrawerContext = createSimpleContext<{
  isExpanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
}>('Drawer');

const drawerVariants = cva(
  ['w-[520px] h-full border-grey-90 sticky z-10 top-0 border-l', 'transition-all duration-500'],
  {
    variants: {
      expanded: {
        false: '',
        true: 'translate-x-[calc(-80vw_+_519px)] shadow-2xl',
      },
    },
  },
);
const drawerContainerVariants = cva(
  ['bg-grey-100 h-full overflow-y-auto', 'transition-all duration-500'],
  {
    variants: {
      expanded: {
        false: 'w-[519px]',
        true: 'w-[80vw]',
      },
    },
  },
);

export type CaseManagerDrawerProps = {
  children: ReactNode;
};

export function CaseManagerDrawer({ children }: CaseManagerDrawerProps) {
  const [drawerExpanded, setDrawerExpanded] = useState(false);

  return (
    <DrawerContext.Provider value={{ isExpanded: drawerExpanded, setExpanded: setDrawerExpanded }}>
      <aside className={drawerVariants({ expanded: drawerExpanded })}>
        <div className={drawerContainerVariants({ expanded: drawerExpanded })}>{children}</div>
      </aside>
    </DrawerContext.Provider>
  );
}

export function CaseManagerDrawerButtons({ expandable = false }: { expandable?: boolean }) {
  const context = DrawerContext.useValue();

  return (
    <div className="p-4">
      <div className="border-grey-90 bg-grey-100 z-10 flex gap-2 rounded border p-1">
        <DrawerIcon
          size="small"
          active={!context.isExpanded}
          onClick={expandable ? () => context.setExpanded(false) : undefined}
        />
        <div className="border-grey-90 w-px border-l" />
        <DrawerIcon
          size="large"
          active={context.isExpanded}
          onClick={expandable ? () => context.setExpanded(true) : undefined}
        />
      </div>
    </div>
  );
}

export function DrawerBreadcrumb({ items }: { items: string[] }) {
  return (
    <div className="flex shrink-0 items-center gap-3 font-medium">
      {items.map((item, i) => {
        return (
          <Fragment key={`${item}_${i}`}>
            <span>{item}</span>
            {i < items.length - 1 ? <span className="text-grey-90">/</span> : null}
          </Fragment>
        );
      })}
    </div>
  );
}
