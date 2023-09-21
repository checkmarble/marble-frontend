import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

const defaultMatchOptions = {
  insideWords: true,
  findAllOccurrences: false,
  requireMatchAll: false,
};

export function adaptHighlightedParts(text: string, query: string) {
  const matches = match(text, query, defaultMatchOptions);
  return parse(text, matches);
}
