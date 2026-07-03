import { useCallback, useEffect, useRef, useState } from 'react';
import { getDisplayedTextForWords, getWordChunks } from './wordChunks';

export function useWritingText(text: string | undefined, pace: number = 5) {
  const [displayText, setDisplayText] = useState('');
  const [isTruncated, setIsTruncated] = useState(false);
  const lastIndexRef = useRef(0);
  const stopAtIndexRef = useRef<number | undefined>(undefined);
  const rafIdRef = useRef<number | undefined>(undefined);

  const stopAt = useCallback(
    (index: number) => {
      if (!text) return;

      const cappedIndex = Math.max(0, Math.min(index, text.length));
      stopAtIndexRef.current = cappedIndex;
      setIsTruncated(true);
      lastIndexRef.current = cappedIndex;
      setDisplayText(text.slice(0, cappedIndex));

      if (rafIdRef.current !== undefined) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = undefined;
      }
    },
    [text],
  );

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      setIsTruncated(false);
      lastIndexRef.current = 0;
      stopAtIndexRef.current = undefined;
      return;
    }

    const wordChunks = getWordChunks(text);
    const startTime = performance.now();
    lastIndexRef.current = 0;
    stopAtIndexRef.current = undefined;
    setIsTruncated(false);
    setDisplayText('');

    const tick = (now: number) => {
      const charCap = stopAtIndexRef.current ?? text.length;
      const wordsToShow = Math.min(Math.floor((now - startTime) / pace), wordChunks.length);
      const nextDisplayText = getDisplayedTextForWords(text, wordChunks, wordsToShow, charCap);

      if (nextDisplayText.length !== lastIndexRef.current) {
        lastIndexRef.current = nextDisplayText.length;
        setDisplayText(nextDisplayText);
      }

      const hasMoreWords = wordsToShow < wordChunks.length;
      const belowCharCap = nextDisplayText.length < charCap;

      if (hasMoreWords && belowCharCap) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = undefined;
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current !== undefined) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [text, pace]);

  return {
    text: displayText,
    isDone: text ? isTruncated || displayText.length === text.length : false,
    isTruncated,
    stopAt,
  };
}
