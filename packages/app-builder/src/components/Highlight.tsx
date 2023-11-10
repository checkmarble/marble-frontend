import { adaptHighlightedParts } from '@app-builder/utils/search';
import { forwardRef, Fragment } from 'react';

export const Highlight = forwardRef<
  HTMLDivElement,
  { text: string; query: string }
>(function Highlight({ text, query, ...divProps }, ref) {
  const parts = adaptHighlightedParts(text, query);

  return (
    <div ref={ref} {...divProps}>
      {parts.map((part, index) =>
        part.highlight ? (
          <mark
            key={index}
            className="bg-transparent font-semibold text-purple-100"
          >
            {part.text}
          </mark>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        )
      )}
    </div>
  );
});
