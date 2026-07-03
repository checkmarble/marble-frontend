export function getWordChunks(text: string): string[] {
  if (!text) return [];

  const chunks: string[] = [];
  let index = 0;

  while (index < text.length) {
    const whitespaceStart = index;
    while (index < text.length && /\s/.test(text[index]!)) {
      index++;
    }
    const whitespace = text.slice(whitespaceStart, index);

    const wordStart = index;
    while (index < text.length && /\S/.test(text[index]!)) {
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

export function getDisplayedTextForWords(
  text: string,
  wordChunks: string[],
  wordsToShow: number,
  charCap: number,
): string {
  return wordChunks.slice(0, wordsToShow).join('').slice(0, charCap);
}
