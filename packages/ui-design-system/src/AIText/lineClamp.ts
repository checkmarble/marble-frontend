export function hasLineClampOverflow(element: HTMLElement): boolean {
  return element.scrollHeight > element.clientHeight + 1;
}

export function findStopIndexForMaxLines(
  clampElement: HTMLElement,
  typingElement: HTMLElement,
  fullText: string,
  currentLength: number,
): number {
  for (let index = currentLength - 1; index >= 0; index--) {
    typingElement.textContent = fullText.slice(0, index);
    if (!hasLineClampOverflow(clampElement)) {
      return index;
    }
  }

  return 0;
}
