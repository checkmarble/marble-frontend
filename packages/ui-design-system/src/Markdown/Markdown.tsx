import ReactMarkdown from 'react-markdown';
import { Code } from '../Code/Code';

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <div className="text-l font-bold mb-2">{children}</div>,
        h2: ({ children }) => <div className="text-m font-bold mb-2">{children}</div>,
        h3: ({ children }) => <div className="text-s font-bold mb-2">{children}</div>,
        p: ({ children }) => <p className="mb-2">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-disc pl-4">{children}</ul>,
        ol: ({ children }) => <ul className="mb-2 list-decimal pl-4">{children}</ul>,
        code: ({ children }) => <Code className="font-mono">{children}</Code>,
        hr: () => <hr className="mb-2 bg-grey-90" />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
