import {
  type ComponentPropsWithoutRef,
  cloneElement,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';

const DEFAULT_INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, summary, [role="button"], [role="link"]';

const getRowLink = (currentTarget: EventTarget | null) => {
  if (!(currentTarget instanceof HTMLElement)) return null;
  const rowLink = currentTarget.querySelector('[data-row-link]');
  return rowLink instanceof HTMLAnchorElement ? rowLink : null;
};

const isInteractiveTarget = (
  target: EventTarget | null,
  currentTarget: EventTarget | null,
  interactiveSelector: string,
) => {
  if (!(target instanceof HTMLElement)) return false;
  const interactiveTarget = target.closest(interactiveSelector);
  return interactiveTarget !== null && interactiveTarget !== currentTarget;
};

export interface LinkWrapperProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  interactiveSelector?: string;
  link: ReactElement;
}

export function LinkWrapper({
  children,
  interactiveSelector = DEFAULT_INTERACTIVE_SELECTOR,
  link,
  onClick,
  onKeyDown,
  role = 'link',
  tabIndex = 0,
  ...props
}: LinkWrapperProps) {
  const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (isInteractiveTarget(event.target, event.currentTarget, interactiveSelector)) return;
    onClick?.(event);
    if (event.defaultPrevented) return;

    const rowLink = getRowLink(event.currentTarget);
    if (rowLink) {
      rowLink.dispatchEvent(new MouseEvent(event.type, event.nativeEvent));
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (isInteractiveTarget(event.target, event.currentTarget, interactiveSelector)) return;
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    getRowLink(event.currentTarget)?.click();
  };

  return (
    <div {...props} onClick={handleClick} onKeyDown={handleKeyDown} role={role} tabIndex={tabIndex}>
      <div aria-hidden className="hidden">
        {cloneElement(link as ReactElement<Record<string, unknown>>, {
          'data-row-link': '',
          tabIndex: -1,
        })}
      </div>
      {children}
    </div>
  );
}
