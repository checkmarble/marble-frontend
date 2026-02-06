import { adaptHighlightedParts } from '@app-builder/utils/search';
import { Fragment, forwardRef } from 'react';

/**
 * Highlight a part of a text that matches a query.
 * It returns a `span` element so it can be truncated with `text-ellipsis`.
 */
export const Highlight = forwardRef<
  HTMLDivElement,
  { text: string; query: string; markClassName?: string } & React.ComponentPropsWithoutRef<'span'>
>(function Highlight({ text, query, markClassName, ...spanProps }, ref) {
  const parts = adaptHighlightedParts(text, query);

  return (
    <span ref={ref} {...spanProps}>
      {parts.map((part, index) =>
        part.highlight ? (
          <mark key={index} className={markClassName ?? 'text-purple-primary bg-transparent'}>
            {part.text}
          </mark>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </span>
  );
});
