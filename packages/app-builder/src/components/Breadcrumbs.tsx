import { Link, useMatches } from '@remix-run/react';
import { Future } from '@swan-io/boxed';
import clsx from 'clsx';
import {
  type FunctionComponent,
  type PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { filter } from 'remeda';

import { Page } from './Page';

type Links = {
  Element: FunctionComponent<BreadCrumbProps> | undefined;
  pathname: string;
}[];

export type BreadCrumbProps = {
  isLast: boolean;
};

const Separator = () => (
  <span className="text-s text-grey-80 font-bold">/</span>
);

const LinkWrapper = ({
  isLast,
  children,
  pathname,
}: PropsWithChildren<{ isLast: boolean; pathname: string }>) => {
  return isLast ? (
    children
  ) : (
    <Link
      to={pathname}
      className={clsx('transition-colors', {
        'text-grey-50 hover:text-grey-00': !isLast,
      })}
    >
      {children}
    </Link>
  );
};

export const BreadCrumbs = () => {
  const matches = useMatches();
  const [links, setLinks] = useState<Links>([]);

  useEffect(() => {
    Future.all(
      matches.map(({ id, pathname }) =>
        Future.fromPromise(
          import(/* @vite-ignore */ `../${id}`) as Promise<{
            BreadCrumb?: FunctionComponent;
          }>,
        ).map((result) => ({
          Element: result.isOk() ? result.value.BreadCrumb : undefined,
          pathname,
        })),
      ),
    )
      .map(filter((r) => r.Element !== undefined))
      .then(setLinks);
  }, [matches]);

  return (
    <div className="flex flex-row items-center gap-4">
      {links.length > 1 ? <Page.BackLink to={links.at(-2)!.pathname} /> : null}
      {links.map(({ Element, pathname }, i) => {
        const isLast = i === links.length - 1;

        return Element ? (
          <div className="text-s flex items-center gap-4 font-bold" key={i}>
            <LinkWrapper isLast={isLast} pathname={pathname}>
              <Element isLast={isLast} />
            </LinkWrapper>
            {!isLast ? <Separator /> : null}
          </div>
        ) : null;
      })}
    </div>
  );
};
