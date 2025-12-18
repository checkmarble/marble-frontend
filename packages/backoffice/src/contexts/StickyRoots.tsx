import useIntersection from '@bo/hooks/useIntersection';
import { RefObject, useEffect, useRef } from 'react';
import { createSharpFactory } from 'sharpstate';

type StickyRootsStoreValue = {
  stickyRoots: Record<string, RefObject<HTMLElement>>;
};

export const StickyRootsSharp = createSharpFactory({
  name: 'StickyRoots',
  initializer: (): StickyRootsStoreValue => ({
    stickyRoots: {},
  }),
}).withActions({
  addStickyRoot(api, name: string, ref: RefObject<HTMLElement>) {
    api.value.stickyRoots[name] = ref;
  },
  removeStickyRoot(api, name: string) {
    delete api.value.stickyRoots[name];
  },
});

export const StickyRootsProvider = ({ children }: { children: React.ReactNode }) => {
  const stickyRootsSharp = StickyRootsSharp.createSharp();

  return <StickyRootsSharp.Provider value={stickyRootsSharp}>{children}</StickyRootsSharp.Provider>;
};

export const useStickyRoot = (name: string, ref: RefObject<HTMLElement>) => {
  const stickyRootsSharp = StickyRootsSharp.useSharp();

  useEffect(() => {
    stickyRootsSharp.actions.addStickyRoot(name, ref);
    return () => {
      stickyRootsSharp.actions.removeStickyRoot(name);
    };
  }, [ref, stickyRootsSharp]);
};

type StickyIntersectionOptions = Omit<IntersectionObserverInit, 'root'> & {
  root?: string;
};

export const useStickyIntersection = (sentinelRef: RefObject<HTMLElement>, options: StickyIntersectionOptions) => {
  const stickyRootsSharp = StickyRootsSharp.useSharp();

  const intersection = useIntersection(sentinelRef, {
    ...options,
    root: options.root ? stickyRootsSharp.value.stickyRoots[options.root]?.$current?.value : undefined,
  });

  return intersection;
};

type StickySentinelProps = {
  children: React.ReactNode;
  root?: string;
  className?: string;
  threshold?: number;
  rootMargin?: string;
};

export const StickySentinel = ({ className, children, ...intersectionOptions }: StickySentinelProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const intersection = useStickyIntersection(ref, intersectionOptions);
  const isStickied = intersection ? !intersection.isIntersecting : false;

  return (
    <div data-sticky={isStickied} className="contents">
      <div className={className} ref={ref} />
      {children}
    </div>
  );
};
