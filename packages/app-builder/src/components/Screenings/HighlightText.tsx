import clsx from 'clsx';
import { type ReactNode, useMemo } from 'react';

interface HighlightTextProps {
  text: string;
  highlight: string | undefined;
  className?: string;
}

/**
 * Highlights text when it exactly matches the highlight term or any word in it.
 * Case-insensitive comparison.
 * - "Vladimir Putin" highlights "Vladimir", "Putin", or "Vladimir Putin"
 */
export function HighlightText({ text, highlight, className }: HighlightTextProps): ReactNode {
  const isMatch = useMemo(() => {
    if (!highlight || highlight.length === 0) {
      return false;
    }

    const textLower = text.toLowerCase();
    const highlightLower = highlight.toLowerCase();

    // Check exact match with full search term
    if (textLower === highlightLower) {
      return true;
    }

    // Check if text matches any individual word from the search term
    const words = highlightLower.split(/\s+/).filter((word) => word.length > 0);
    return words.some((word) => textLower === word);
  }, [text, highlight]);

  if (isMatch) {
    return <mark className={clsx('bg-yellow-background rounded-sm', className)}>{text}</mark>;
  }

  return <span className={className}>{text}</span>;
}
