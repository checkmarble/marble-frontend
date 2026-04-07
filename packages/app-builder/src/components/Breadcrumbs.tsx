import { Page } from '@app-builder/components/Page';
import { createLink, type LinkComponent, useMatches } from '@tanstack/react-router';
import React, { type FunctionComponent, useMemo } from 'react';
import { cn } from 'ui-design-system';

export type BreadCrumbProps<T = unknown> = {
  isLast: boolean;
  data: T;
};

export type HandleWithBreadCrumbs = {
  BreadCrumbs?: FunctionComponent<BreadCrumbProps>[];
};

type BreadCrumbEntry = {
  Elements: FunctionComponent<BreadCrumbProps>[] | undefined;
  pathname: string;
  data: unknown;
};

interface BreadCrumbLinkInnerProps extends React.ComponentPropsWithRef<'a'> {
  isLast: boolean;
}

const BreadCrumbLinkInner = React.forwardRef<HTMLAnchorElement, BreadCrumbLinkInnerProps>(
  ({ isLast, className, children, ...props }, ref) => (
    <a
      ref={ref}
      {...props}
      className={cn(
        'text-s flex items-center font-bold transition-colors',
        { 'text-grey-secondary hover:text-grey-primary': !isLast },
        className,
      )}
    >
      {children}
    </a>
  ),
);
BreadCrumbLinkInner.displayName = 'BreadCrumbLinkInner';

const CreatedBreadCrumbLink = createLink(BreadCrumbLinkInner);

export const BreadCrumbLink: LinkComponent<typeof BreadCrumbLinkInner> = (props) => (
  <CreatedBreadCrumbLink preload="intent" {...props} />
);

export const BreadCrumbs = ({ back }: { back?: string }) => {
  const matches = useMatches();
  const links = useMemo<BreadCrumbEntry[]>(
    () =>
      (matches as { staticData: unknown; pathname: string; loaderData: unknown }[])
        .filter((match) => Boolean((match.staticData as HandleWithBreadCrumbs)?.BreadCrumbs))
        .map((match) => ({
          Elements: (match.staticData as HandleWithBreadCrumbs)?.BreadCrumbs?.filter(Boolean),
          pathname: match.pathname,
          data: match.loaderData,
        })),
    [matches],
  );

  return (
    <div className="flex flex-row items-center gap-4">
      {back ? <Page.BackLink to={back} /> : links.length > 1 ? <Page.BackLink to={links.at(-2)!.pathname} /> : null}
      {links.map(({ Elements, pathname, data }, linkIndex) => {
        const isLastLink = linkIndex === links.length - 1;

        return Elements
          ? Elements.map((Element, elementIndex) => {
              const isLastElement = elementIndex === Elements.length - 1;

              return (
                <div className="flex items-center gap-4" key={`${pathname}-${elementIndex}`}>
                  <Element key={pathname} isLast={isLastElement && isLastLink} data={data} />
                  {!(isLastElement && isLastLink) ? (
                    <span className="text-s text-grey-disabled font-bold">/</span>
                  ) : null}
                </div>
              );
            })
          : null;
      })}
    </div>
  );
};

type BackButtonEntry = {
  Elements: FunctionComponent<BreadCrumbProps>[] | undefined;
  pathname: string;
};

export const BackButton = ({ back }: { back?: string }) => {
  const matches = useMatches();
  const links = useMemo<BackButtonEntry[]>(
    () =>
      (matches as { staticData: unknown; pathname: string }[])
        .filter((match) => Boolean((match.staticData as HandleWithBreadCrumbs)?.BreadCrumbs))
        .map((match) => ({
          Elements: (match.staticData as HandleWithBreadCrumbs)?.BreadCrumbs?.filter(Boolean),
          pathname: match.pathname,
        })),
    [matches],
  );
  return (
    <div className="flex flex-row items-center gap-4">
      {back ? <Page.BackLink to={back} /> : links.length > 1 ? <Page.BackLink to={links.at(-2)!.pathname} /> : null}
    </div>
  );
};
