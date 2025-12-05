import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
} from '@radix-ui/react-hover-card';
import { type Components } from 'react-markdown';
import { Icon } from 'ui-icons';
import { Markdown } from './Markdown';

const releaseMarkdownComponents: Components = {
  a: ({ children, href, title }) => (
    // replace with tooltip component
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
        <HoverCardContent className="bg-grey-100 flex flex-col gap-2 items-center border border-grey-90 rounded-sm shadow-md z-50">
          <HoverCardArrow className="fill-grey-100" />

          <p className="text-m font-medium">{title}</p>
          <a href={href} className="text-s text-purple-65">
            {href}
          </a>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  ),
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
    <code className="bg-grey-background [.group\/code-block_&]:bg-transparent text-s font-mono rounded px-1 py-0.5">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <div className="bg-grey-background-light rounded-sm p-3 mb-2 flex gap-2 items-start">
      <Icon icon="code" className="size-4 shrink-0 text-purple-65 mt-0.5" />
      <pre className="text-s font-mono overflow-x-auto flex-1 group/code-block">{children}</pre>
    </div>
  ),
};

interface ReleaseMarkdownProps {
  children: string;
}

export function ReleaseMarkdown({ children }: ReleaseMarkdownProps) {
  return <Markdown components={releaseMarkdownComponents}>{children}</Markdown>;
}
