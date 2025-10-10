import { useEffect, useRef, useState } from 'react';

export function useWritingText(text: string | undefined, pace: number = 20) {
  const [displayText, setDisplayText] = useState('');
  const currentText = useRef(text);

  useEffect(() => {
    if (text !== currentText.current) {
      setDisplayText('');
      currentText.current = text;
    }

    if (!text) {
      return;
    }

    let i = 0;

    const intervalId = setInterval(() => {
      setDisplayText(text.slice(0, i));

      if (++i > text.length) {
        clearInterval(intervalId);
      }
    }, pace);

    return () => clearInterval(intervalId);
  }, [text, pace]);

  return {
    text: displayText,
    isDone: displayText === text,
  };
}
