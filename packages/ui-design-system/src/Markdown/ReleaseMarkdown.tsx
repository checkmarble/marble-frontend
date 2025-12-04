import { type Components } from 'react-markdown';
import { Icon } from 'ui-icons';
import { Markdown } from './Markdown';

const releaseMarkdownComponents: Components = {
  h1: ({ children }) => <div className="text-l font-semibold text-grey-00 mb-4 first:mt-0">{children}</div>,
  h2: ({ children }) => <div className="text-s font-medium text-purple-65 mb-2 mt-4 first:mt-0">{children}</div>,
  h3: ({ children }) => <div className="text-s font-medium text-purple-65 mb-2 mt-4 first:mt-0">{children}</div>,
  hr: () => <hr className="my-4 border-grey-90" />,
  blockquote: ({ children }) => (
    <div className="bg-purple-98 border-s-2 border-s-purple-65 rounded-sm p-2 mb-2 flex items-start gap-2">
      <Icon icon="quote" className="size-4 shrink-0 text-purple-65 mt-0.5" />
      <div className="text-s text-grey-00">{children}</div>
    </div>
  ),
  ul: ({ children }) => <ul className="mb-2 list-disc pl-5 space-y-1">{children}</ul>,
  li: ({ children }) => <li className="text-s">{children}</li>,
  p: ({ children }) => <p className="text-s mb-2 last:mb-0">{children}</p>,
  code: ({ children }) => (
    <code className="bg-grey-background-light text-s font-mono rounded px-1 py-0.5">{children}</code>
  ),
  pre: ({ children }) => (
    <div className="bg-grey-background-light rounded-sm p-3 mb-2 flex gap-2 items-start">
      <Icon icon="code" className="size-4 shrink-0 text-purple-65 mt-0.5" />
      <pre className="text-s font-mono overflow-x-auto flex-1">{children}</pre>
    </div>
  ),
};

interface ReleaseMarkdownProps {
  children: string;
}

export function ReleaseMarkdown({ children }: ReleaseMarkdownProps) {
  return <Markdown components={releaseMarkdownComponents}>{children}</Markdown>;
}
