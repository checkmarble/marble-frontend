import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { M as Markdown } from "./Markdown-sjqeOXzy.js";
import { d as cn } from "./format-NPGUXq-g.js";
function hasLineClampOverflow(element) {
  return element.scrollHeight > element.clientHeight + 1;
}
function findStopIndexForMaxLines(clampElement, typingElement, fullText, currentLength) {
  for (let index = currentLength - 1; index >= 0; index--) {
    typingElement.textContent = fullText.slice(0, index);
    if (!hasLineClampOverflow(clampElement)) {
      return index;
    }
  }
  return 0;
}
function getWordChunks(text) {
  if (!text) return [];
  const chunks = [];
  let index = 0;
  while (index < text.length) {
    const whitespaceStart = index;
    while (index < text.length && /\s/.test(text[index])) {
      index++;
    }
    const whitespace = text.slice(whitespaceStart, index);
    const wordStart = index;
    while (index < text.length && /\S/.test(text[index])) {
      index++;
    }
    const word = text.slice(wordStart, index);
    if (word) {
      chunks.push(whitespace + word);
    } else if (whitespace) {
      chunks.push(whitespace);
    }
  }
  return chunks;
}
function getDisplayedTextForWords(text, wordChunks, wordsToShow, charCap) {
  return wordChunks.slice(0, wordsToShow).join("").slice(0, charCap);
}
function useWritingText(text, pace = 5) {
  const [displayText, setDisplayText] = reactExports.useState("");
  const [isTruncated, setIsTruncated] = reactExports.useState(false);
  const lastIndexRef = reactExports.useRef(0);
  const stopAtIndexRef = reactExports.useRef(void 0);
  const rafIdRef = reactExports.useRef(void 0);
  const stopAt = reactExports.useCallback(
    (index) => {
      if (!text) return;
      const cappedIndex = Math.max(0, Math.min(index, text.length));
      stopAtIndexRef.current = cappedIndex;
      setIsTruncated(true);
      lastIndexRef.current = cappedIndex;
      setDisplayText(text.slice(0, cappedIndex));
      if (rafIdRef.current !== void 0) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = void 0;
      }
    },
    [text]
  );
  reactExports.useEffect(() => {
    if (!text) {
      setDisplayText("");
      setIsTruncated(false);
      lastIndexRef.current = 0;
      stopAtIndexRef.current = void 0;
      return;
    }
    const wordChunks = getWordChunks(text);
    const startTime = performance.now();
    lastIndexRef.current = 0;
    stopAtIndexRef.current = void 0;
    setIsTruncated(false);
    setDisplayText("");
    const tick = (now) => {
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
        rafIdRef.current = void 0;
      }
    };
    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current !== void 0) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [text, pace]);
  return {
    text: displayText,
    isDone: text ? isTruncated || displayText.length === text.length : false,
    isTruncated,
    stopAt
  };
}
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? reactExports.useLayoutEffect : reactExports.useEffect;
function getLineClampStyle(maxLines) {
  return {
    display: "-webkit-box",
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  };
}
function AIText({ text, pace = 20, maxLines, className }) {
  const { text: displayedText, isDone, isTruncated, stopAt } = useWritingText(text, pace);
  const contentRef = reactExports.useRef(null);
  const clampRef = reactExports.useRef(null);
  const typingRef = reactExports.useRef(null);
  const [currentHeight, setCurrentHeight] = reactExports.useState(void 0);
  reactExports.useEffect(() => {
    setCurrentHeight(void 0);
  }, [text]);
  useIsomorphicLayoutEffect(() => {
    if (!maxLines || isTruncated) return;
    const clampElement = clampRef.current;
    const typingElement = typingRef.current;
    if (!clampElement || !typingElement || !displayedText) return;
    if (!hasLineClampOverflow(clampElement)) return;
    const stopIndex = findStopIndexForMaxLines(clampElement, typingElement, text, displayedText.length);
    typingElement.textContent = displayedText;
    stopAt(stopIndex);
  }, [displayedText, isTruncated, maxLines, stopAt, text]);
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
        setCurrentHeight(void 0);
      }
    }
  }, [displayedText]);
  const showMarkdown = isDone && !isTruncated && !maxLines;
  const content = showMarkdown ? /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: text }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: typingRef, className: "whitespace-pre-wrap", children: displayedText });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "bg-surface-card rounded-sm border border-l-2 border-l-purple-primary border-grey-border text-grey-primary text-small overflow-hidden transition-all duration-500",
        className
      ),
      style: { height: currentHeight ? `${currentHeight}px` : void 0 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: contentRef, className: "p-sm", children: maxLines ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: clampRef, style: getLineClampStyle(maxLines), children: content }) : content })
    }
  );
}
export {
  AIText as A
};
