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
          className="bg-grey-100 p-4 flex flex-col gap-2 items-center border border-grey-90 rounded-sm shadow-md"
        >
          <HoverCardArrow className="fill-grey-100" />

          <p className="text-m font-medium">{title}</p>
          <a href={href} className="text-s text-purple-65">
            {href}
          </a>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  );
}
