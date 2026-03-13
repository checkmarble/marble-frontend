import { useEffect, useState } from 'react';

type TailwindBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

function getBreakpointValue(breakpoint: TailwindBreakpoint) {
  if (typeof window === 'undefined') return null;

  const value = getComputedStyle(document.documentElement).getPropertyValue(`--breakpoint-${breakpoint}`).trim();

  return value || null;
}

export function useMediaQuery(breakpoint: TailwindBreakpoint) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const breakpointValue = getBreakpointValue(breakpoint);
    if (!breakpointValue) return;

    const mediaQuery = window.matchMedia(`(min-width: ${breakpointValue})`);

    const handleChange = () => {
      setMatches(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [breakpoint]);

  return matches;
}
