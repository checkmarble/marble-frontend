import { Link, useMatches } from '@remix-run/react';
import clsx from 'clsx';
import { select } from 'radash';
import { type FunctionComponent, type PropsWithChildren, useMemo } from 'react';

import { Page } from './Page';

export type BreadCrumbProps = {
  isLast: boolean;
};

export type HandleWithBreadCrumbs = {
  BreadCrumbs?: FunctionComponent<BreadCrumbProps>[];
};

export const BreadCrumbLink = ({
  isLast,
  children,
  to,
  className,
}: PropsWithChildren<{
  isLast: boolean;
  to: string;
  className?: string;
}>) => (
  <Link
    to={to}
    className={clsx(
      'text-s flex items-center font-bold transition-colors',
      { 'text-grey-50 hover:text-grey-00': !isLast },
      className,
    )}
  >
    {children}
  </Link>
);

export const BreadCrumbs = () => {
  const matches = useMatches();

  const links = useMemo(
    () =>
      select(
        matches,
        ({ pathname, handle }) => ({
          Elements: (handle as HandleWithBreadCrumbs)?.BreadCrumbs?.filter(
            Boolean,
          ),
          pathname,
        }),
        ({ handle }) => Boolean((handle as HandleWithBreadCrumbs)?.BreadCrumbs),
      ),
    [matches],
  );

  return (
    <div className="flex flex-row items-center gap-4">
      {links.length > 1 ? <Page.BackLink to={links.at(-2)!.pathname} /> : null}
      {links.map(({ Elements, pathname }, linkIndex) => {
        const isLastLink = linkIndex === links.length - 1;

        return Elements
          ? Elements.map((Element, elementIndex) => {
              const isLastElement = elementIndex === Elements.length - 1;

              return (
                <div
                  className="flex items-center gap-4"
                  key={`${pathname}-${elementIndex}`}
                >
                  <Element
                    key={pathname}
                    // eslint-disable-next-line react/jsx-no-leaked-render
                    isLast={isLastElement && isLastLink}
                  />
                  {!(isLastElement && isLastLink) ? (
                    <span className="text-s text-grey-80 font-bold">/</span>
                  ) : null}
                </div>
              );
            })
          : null;
      })}
    </div>
  );
};
