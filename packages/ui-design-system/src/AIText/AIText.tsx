import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Markdown } from '../Markdown/Markdown';
import { cn } from '../utils';
import { findStopIndexForMaxLines, hasLineClampOverflow } from './lineClamp';
import { useWritingText } from './useWritingText';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function getLineClampStyle(maxLines: number): CSSProperties {
  return {
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };
}

interface AITextProps {
  text: string;
  pace?: number;
  maxLines?: number;
  className?: string;
}

export function AIText({ text, pace = 5, maxLines, className }: AITextProps) {
  const { text: displayedText, isDone, isTruncated, stopAt } = useWritingText(text, pace);
  const contentRef = useRef<HTMLDivElement>(null);
  const clampRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);
  const [currentHeight, setCurrentHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    setCurrentHeight(undefined);
  }, [text]);

  useIsomorphicLayoutEffect(() => {
    if (!maxLines || isTruncated || isDone) return;

    const clampElement = clampRef.current;
    const typingElement = typingRef.current;
    if (!clampElement || !typingElement || !displayedText) return;

    if (!hasLineClampOverflow(clampElement)) return;

    const stopIndex = findStopIndexForMaxLines(clampElement, typingElement, text, displayedText.length);
    typingElement.textContent = displayedText;
    stopAt(stopIndex);
  }, [displayedText, isDone, isTruncated, maxLines, stopAt, text]);

  useIsomorphicLayoutEffect(() => {
    if (isDone && contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      setCurrentHeight(rect.height + 2);
    }
  }, [isDone]);

  useIsomorphicLayoutEffect(() => {
    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      if (currentHeight && rect.height > currentHeight - 2) {
        setCurrentHeight(undefined);
      }
    }
  }, [displayedText]);

  const content =
    isDone && !isTruncated ? (
      <Markdown>{text}</Markdown>
    ) : (
      <div ref={typingRef} className="whitespace-pre-wrap">
        {displayedText}
      </div>
    );

  return (
    <div
      className={cn(
        'bg-surface-card rounded-sm border border-l-2 border-l-purple-primary border-grey-border text-grey-primary text-small overflow-hidden transition-all duration-500',
        className,
      )}
      style={{ height: currentHeight ? `${currentHeight}px` : undefined }}
    >
      <div ref={contentRef} className="p-sm">
        {maxLines ? (
          <div ref={clampRef} style={getLineClampStyle(maxLines)}>
            {content}
          </div>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
