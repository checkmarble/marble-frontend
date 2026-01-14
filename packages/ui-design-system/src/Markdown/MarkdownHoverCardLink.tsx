import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
} from '@radix-ui/react-hover-card';

export function MarkdownHoverCardLink({
  children,
  href,
  title,
}: {
  children: React.ReactNode;
  href: string;
  title: string;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <a
          href={href}
          className="text-purple-primary hover:bg-purple-background hover:text-grey-secondary text-underline underline-offset-4 decoration-purple-primary"
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
          className="bg-surface-card p-4 flex flex-col gap-2 items-center border border-grey-border rounded-sm shadow-md"
        >
          <HoverCardArrow className="fill-grey-white" />

          <p className="text-m font-medium">{title}</p>
          <a href={href} className="text-s text-purple-primary">
            {href}
          </a>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  );
}
