import { experimental_streamedQuery as streamedQuery, useQuery } from '@tanstack/react-query';

async function* readStream(stream: ReadableStream<string>) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

// Shortens the input until it fits the model input quota. Lines are ordered by significance,
// so the least significant ones are cut first.
async function fitToQuota(summarizer: Summarizer, input: string) {
  let text = input;
  console.log('input quota (tokens)', summarizer.inputQuota);
  console.log('input length (characters)', text.length);
  while (text.length > 0) {
    const usage = await summarizer.measureInputUsage(text);
    console.log('usage (tokens)', usage);
    if (usage <= summarizer.inputQuota) return text;
    const target = Math.floor(text.length * (summarizer.inputQuota / usage) * 0.9);
    const lastLineBreak = text.lastIndexOf('\n', target);
    text = text.slice(0, lastLineBreak > 0 ? lastLineBreak : target);
  }
  return text;
}

export const useEntityAISummaryQuery = ({
  entityId,
  language,
  input,
  summarizer,
}: {
  entityId: string;
  language: string | undefined;
  input: string | undefined;
  summarizer: Summarizer | undefined;
}) => {
  return useQuery({
    queryKey: ['screening', 'entity-ai-summary', entityId, language],
    queryFn: streamedQuery({
      streamFn: async ({ signal }) => {
        if (!summarizer || !input) throw new Error('Summarizer is not ready');
        const text = await fitToQuota(summarizer, input);
        return readStream(summarizer.summarizeStreaming(text, { signal }));
      },
      reducer: (summary: string, chunk: string) => summary + chunk,
      initialValue: '',
    }),
    enabled: !!summarizer && !!input && !!language,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
};
