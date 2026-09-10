import { useIsomorphicLayoutEffect } from '@app-builder/utils/hooks/use-isomorphic-layout-effect';
import { type ReactNode, type RefObject, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AIText, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

const FLY_DURATION_MS = 300;

type AiDescriptionProps = {
  isPending: boolean;
  description: string | undefined;
  className?: string;
  docked?: boolean;
};

export function AiDescription({ isPending, description, className, docked = false }: AiDescriptionProps) {
  const { t } = useTranslation(['scenarios']);
  const slotRef = useRef<HTMLDivElement>(null);
  const lastInlineRectRef = useRef<DOMRect | null>(null);
  const lastDockedRectRef = useRef<DOMRect | null>(null);

  const content = (
    <div
      className={cn(
        'text-default rounded-md border border-purple-border bg-purple-background-light text-purple-primary flex flex-col gap-sm p-md dark:border-grey-border',
        docked && 'shadow-md',
        className,
      )}
    >
      <div className="flex items-center gap-xs">
        <Icon icon="ai-review" className="size-5" />
        <div>{t('scenarios:rules.ai_description.title')}</div>
      </div>
      {description ? <AIText text={description} /> : null}
      {isPending && description ? <div>{t('scenarios:rules.ai_description.check_reformulation')}</div> : null}
    </div>
  );

  useIsomorphicLayoutEffect(() => {
    if (docked || !slotRef.current) return;
    lastInlineRectRef.current = slotRef.current.getBoundingClientRect();
  });

  useIsomorphicLayoutEffect(() => {
    if (docked) return;
    const node = slotRef.current;
    const fromRect = lastDockedRectRef.current;
    lastDockedRectRef.current = null;
    if (!node || !fromRect || prefersReducedMotion()) return;
    playTranslate(node, fromRect);
  }, [docked]);

  if (docked) {
    return (
      <>
        <div ref={slotRef} className="pointer-events-none min-w-0 self-start" aria-hidden />
        <DockedFly slotRef={slotRef} fromRect={lastInlineRectRef.current} rectRef={lastDockedRectRef}>
          {content}
        </DockedFly>
      </>
    );
  }

  return (
    <div ref={slotRef} className={cn('self-start max-w-2xl', className)}>
      {content}
    </div>
  );
}

function DockedFly({
  slotRef,
  fromRect,
  rectRef,
  children,
}: {
  slotRef: RefObject<HTMLDivElement | null>;
  fromRect: DOMRect | null;
  rectRef: RefObject<DOMRect | null>;
  children: ReactNode;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const fromRectRef = useRef(fromRect);
  fromRectRef.current = fromRect;

  useIsomorphicLayoutEffect(() => {
    const slot = slotRef.current;
    const node = nodeRef.current;
    const panel = slot?.closest('[role="dialog"]');
    if (!slot || !node || !(panel instanceof HTMLElement)) return;

    const place = () => {
      const panelRect = panel.getBoundingClientRect();
      const slotRect = slot.getBoundingClientRect();
      node.style.top = `${Math.max(slotRect.top, panelRect.top + 24)}px`;
      node.style.right = `${window.innerWidth - panelRect.left + 16}px`;
      node.style.width = `${Math.min(320, window.innerWidth / 3 - 32)}px`;
      node.style.visibility = 'visible';
      rectRef.current = node.getBoundingClientRect();
    };

    place();
    const origin = fromRectRef.current;
    const canAnimate = Boolean(origin) && !prefersReducedMotion();
    if (origin && canAnimate) {
      playTranslate(node, origin);
    }

    let ignoreUpdates = canAnimate;
    const timeout = window.setTimeout(() => {
      ignoreUpdates = false;
    }, FLY_DURATION_MS);
    const onUpdate = () => {
      if (ignoreUpdates) return;
      place();
    };

    const observer = new ResizeObserver(onUpdate);
    observer.observe(panel);
    panel.addEventListener('scroll', onUpdate, { passive: true });
    window.addEventListener('resize', onUpdate);
    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
      panel.removeEventListener('scroll', onUpdate);
      window.removeEventListener('resize', onUpdate);
    };
  }, [rectRef, slotRef]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div ref={nodeRef} className="fixed z-30" style={{ visibility: 'hidden' }}>
      {children}
    </div>,
    document.body,
  );
}

function playTranslate(node: HTMLElement, fromRect: DOMRect) {
  const last = node.getBoundingClientRect();
  const dx = fromRect.left - last.left;
  const dy = fromRect.top - last.top;
  if (dx === 0 && dy === 0) return;

  const handleEnd = () => {
    node.style.transition = '';
    node.style.transform = '';
    node.removeEventListener('transitionend', handleEnd);
  };

  node.style.transition = 'none';
  node.style.transform = `translate(${dx}px, ${dy}px)`;
  node.getBoundingClientRect();
  node.style.transition = `transform ${FLY_DURATION_MS}ms ease-in-out`;
  node.style.transform = 'none';
  node.addEventListener('transitionend', handleEnd);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
