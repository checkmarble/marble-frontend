import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
} from '@radix-ui/react-hover-card';
import ReactMarkdown, { type Components } from 'react-markdown';
import { Code } from '../Code/Code';

export const defaultMarkdownComponents: Components = {
  a: ({ children, href, title }) => (
    <HoverCard>
      <HoverCardTrigger>
        <a
          href={href}
          className="text-purple-65 hover:bg-purple-96 hover:text-grey-50 text-underline underline-offset-4 decoration-purple-65"
        >
          {children}
        </a>
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent
          side="top"
          align="start"
          alignOffset={-16}
          sideOffset={12}
          className="bg-grey-100 p-4 flex flex-col gap-2 items-center border border-grey-90 rounded-sm shadow-md z-50"
        >
          <HoverCardArrow className="fill-grey-100" />

          <p className="text-m font-medium">{title}</p>
          <a href={href} className="text-s text-purple-65">
            {href}
          </a>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  ),
  h1: ({ children }) => <div className="text-h1 font-bold mb-2">{children}</div>,
  h2: ({ children }) => <div className="text-h2 font-bold mb-2">{children}</div>,
  h3: ({ children }) => <div className="text-default font-bold mb-2">{children}</div>,
  p: ({ children }) => <p className="not-last:mb-2">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc pl-4">{children}</ul>,
  ol: ({ children }) => <ul className="mb-2 list-decimal pl-4">{children}</ul>,
  code: ({ children }) => <Code className="font-mono">{children}</Code>,
  hr: () => <hr className="mb-2 bg-grey-90" />,
};

interface MarkdownProps {
  children: string;
  components?: Components;
}

export function Markdown({ children, components }: MarkdownProps) {
  return <ReactMarkdown components={components ?? defaultMarkdownComponents}>{children}</ReactMarkdown>;
}
