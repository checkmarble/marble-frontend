import { useIsomorphicLayoutEffect } from '@app-builder/utils/hooks/use-isomorphic-layout-effect';
import { type MouseEvent, type ReactNode, useRef, useState } from 'react';
import { Icon } from 'ui-icons';
import { Tag } from '../Tag/Tag';
import { cn } from '../utils';

const OVERFLOW_TAG_WIDTH_PX = 36;

function getElementWidth(el: HTMLElement): number {
  const { width: rectWidth } = el.getBoundingClientRect();
  return Math.max(rectWidth, el.offsetWidth || 0, el.scrollWidth || 0);
}

const overflowButtonClassName = 'cursor-pointer shrink-0 hover:bg-purple-primary/20 transition-colors min-w-min';

export interface ExpandableGroupTagLineProps {
  items: ReactNode[];
  moreButton?: (overflow: number, onExpand: (event: MouseEvent) => void) => ReactNode;
  lessButton?: (onCollapse: (event: MouseEvent) => void) => ReactNode;
  classname?: string;
  trailing?: ReactNode;
  overflowTagWidth?: number;
}

function DefaultMoreButton({ overflow, onExpand }: { overflow: number; onExpand: (event: MouseEvent) => void }) {
  return (
    <Tag color="purple" size="small" className={overflowButtonClassName} onClick={onExpand}>
      +{overflow}
    </Tag>
  );
}

function DefaultLessButton({ onCollapse }: { onCollapse: (event: MouseEvent) => void }) {
  return (
    <Tag color="purple" size="small" className={overflowButtonClassName} onClick={onCollapse}>
      <Icon icon="minus" className="size-3" />
    </Tag>
  );
}

export function ExpandableGroupTagLine({
  items,
  moreButton,
  lessButton,
  classname,
  trailing,
  overflowTagWidth = OVERFLOW_TAG_WIDTH_PX,
}: ExpandableGroupTagLineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [maxVisible, setMaxVisible] = useState(1);
  const [renderedCount, setRenderedCount] = useState(0);
  const [isMeasured, setIsMeasured] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setIsMeasured(false);
    setMaxVisible(1);
    setRenderedCount(0);
  }, [items.length]);

  useIsomorphicLayoutEffect(() => {
    if (isExpanded) return;
    const container = containerRef.current;
    const ghost = ghostRef.current;
    if (!container || !ghost) return;

    const recalculate = () => {
      const availableWidth = container.offsetWidth;
      if (availableWidth === 0) return;

      const gap = parseFloat(getComputedStyle(ghost).gap) || 4;
      const tagEls = Array.from(ghost.children) as HTMLElement[];

      let used = 0;
      let count = 0;
      for (let i = 0; i < tagEls.length; i++) {
        const tw = getElementWidth(tagEls[i]!);
        const gapBefore = i > 0 ? gap : 0;
        const isLast = i === tagEls.length - 1;
        const needed = used + gapBefore + tw + (isLast ? 0 : gap + overflowTagWidth);
        if (needed <= availableWidth) {
          used += gapBefore + tw;
          count++;
        } else {
          break;
        }
      }

      const nextMaxVisible = Math.max(count, 1);
      const nextRenderedCount = tagEls.length;
      setRenderedCount(nextRenderedCount);
      setMaxVisible(nextMaxVisible);
      setIsMeasured(true);
    };

    const observer = new ResizeObserver(recalculate);
    observer.observe(container);
    recalculate();
    return () => observer.disconnect();
  }, [isExpanded, items.length, overflowTagWidth]);

  const effectiveMaxVisible = isMeasured ? maxVisible : Math.min(1, items.length);
  const effectiveRenderedCount = isMeasured ? renderedCount : items.length;
  const overflow = isExpanded ? 0 : Math.max(0, effectiveRenderedCount - effectiveMaxVisible);
  const visibleItems = isExpanded ? items : overflow > 0 ? items.slice(0, effectiveMaxVisible) : items;

  const handleExpand = (event: MouseEvent) => {
    event.stopPropagation();
    setIsExpanded(true);
  };
  const handleCollapse = (event: MouseEvent) => {
    event.stopPropagation();
    setIsExpanded(false);
  };

  return (
    <div ref={containerRef} className="relative min-w-0 w-full flex-1">
      <div
        ref={ghostRef}
        className={cn(
          'pointer-events-none invisible absolute top-0 right-0 left-0 flex items-center gap-sm overflow-x-hidden [&>*]:shrink-0',
          classname,
        )}
        aria-hidden="true"
      >
        {items}
      </div>
      <div
        className={cn(
          'flex min-w-0 items-center gap-sm [&>*]:shrink-0',
          isExpanded ? 'flex-wrap' : 'overflow-hidden',
          classname,
        )}
      >
        {visibleItems}
        {overflow > 0 &&
          (moreButton ? (
            moreButton(overflow, handleExpand)
          ) : (
            <DefaultMoreButton overflow={overflow} onExpand={handleExpand} />
          ))}
        {isExpanded && (lessButton ? lessButton(handleCollapse) : <DefaultLessButton onCollapse={handleCollapse} />)}
        {trailing}
      </div>
    </div>
  );
}
