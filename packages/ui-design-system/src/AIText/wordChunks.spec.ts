import { describe, expect, it } from 'vitest';

import { getDisplayedTextForWords, getWordChunks } from './wordChunks';

describe('wordChunks', () => {
  it('should split text into word chunks while preserving whitespace', () => {
    expect(getWordChunks('Hello world')).toEqual(['Hello', ' world']);
    expect(getWordChunks('  hello')).toEqual(['  hello']);
    expect(getWordChunks('one two three')).toEqual(['one', ' two', ' three']);
  });

  it('should build progressively displayed text by words', () => {
    const chunks = getWordChunks('Hello world');
    expect(getDisplayedTextForWords('Hello world', chunks, 0, 20)).toBe('');
    expect(getDisplayedTextForWords('Hello world', chunks, 1, 20)).toBe('Hello');
    expect(getDisplayedTextForWords('Hello world', chunks, 2, 20)).toBe('Hello world');
  });
});
