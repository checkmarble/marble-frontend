import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from 'ui-icons';
import { Tag } from '../Tag/Tag';
import { cn } from '../utils';

const OVERFLOW_TAG_WIDTH_PX = 36;

const overflowButtonClassName = 'cursor-pointer shrink-0 hover:bg-purple-primary/20 transition-colors';

export interface ExpandableGroupTagLineProps {
  items: ReactNode[];
  moreButton?: (overflow: number, onExpand: () => void) => ReactNode;
  lessButton?: (onCollapse: () => void) => ReactNode;
}

function DefaultMoreButton({ overflow, onExpand }: { overflow: number; onExpand: () => void }) {
  return (
    <Tag color="purple" size="small" className={overflowButtonClassName} onClick={onExpand}>
      +{overflow}
    </Tag>
  );
}

function DefaultLessButton({ onCollapse }: { onCollapse: () => void }) {
  return (
    <Tag color="purple" size="small" className={overflowButtonClassName} onClick={onCollapse}>
      <Icon icon="minus" className="size-3" />
    </Tag>
  );
}

export function ExpandableGroupTagLine({ items, moreButton, lessButton }: ExpandableGroupTagLineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [maxVisible, setMaxVisible] = useState(items.length);

  useLayoutEffect(() => {
    if (isExpanded) return;
    const container = containerRef.current;
    const ghost = ghostRef.current;
    if (!container || !ghost) return;

    const recalculate = () => {
      const gap = parseFloat(getComputedStyle(ghost).gap) || 4;
      const availableWidth = container.offsetWidth;
      const tagEls = Array.from(ghost.children) as HTMLElement[];

      let used = 0;
      let count = 0;
      for (let i = 0; i < tagEls.length; i++) {
        const tw = tagEls[i]!.offsetWidth;
        const gapBefore = i > 0 ? gap : 0;
        const isLast = i === tagEls.length - 1;
        const needed = used + gapBefore + tw + (isLast ? 0 : gap + OVERFLOW_TAG_WIDTH_PX);
        if (needed <= availableWidth) {
          used += gapBefore + tw;
          count++;
        } else {
          break;
        }
      }
      setMaxVisible(Math.max(count, 1));
    };

    const observer = new ResizeObserver(recalculate);
    observer.observe(container);
    recalculate();
    return () => observer.disconnect();
  }, [isExpanded, items.length]);

  const overflow = isExpanded ? 0 : Math.max(0, items.length - maxVisible);
  const visibleItems = overflow > 0 ? items.slice(0, maxVisible) : items;

  const handleExpand = () => setIsExpanded(true);
  const handleCollapse = () => setIsExpanded(false);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div
        ref={ghostRef}
        className="pointer-events-none invisible absolute top-0 right-0 left-0 flex items-center gap-v2-sm"
        aria-hidden="true"
      >
        {items}
      </div>
      <div className={cn('flex items-center gap-v2-sm', isExpanded && 'flex-wrap')}>
        {visibleItems}
        {overflow > 0 &&
          (moreButton ? (
            moreButton(overflow, handleExpand)
          ) : (
            <DefaultMoreButton overflow={overflow} onExpand={handleExpand} />
          ))}
        {isExpanded && (lessButton ? lessButton(handleCollapse) : <DefaultLessButton onCollapse={handleCollapse} />)}
      </div>
    </div>
  );
}
