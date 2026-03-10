import { useEffect, useState } from 'react';

type TailwindBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

function getBreakpointValue(breakpoint: TailwindBreakpoint) {
  if (typeof window === 'undefined') return null;

  const value = getComputedStyle(document.documentElement).getPropertyValue(`--breakpoint-${breakpoint}`).trim();

  return value || null;
}

function getMatches(breakpoint: TailwindBreakpoint) {
  if (typeof window === 'undefined') return false;

  const breakpointValue = getBreakpointValue(breakpoint);
  if (!breakpointValue) return false;

  return window.matchMedia(`(min-width: ${breakpointValue})`).matches;
}

export function useMediaQuery(breakpoint: TailwindBreakpoint) {
  const [matches, setMatches] = useState(() => getMatches(breakpoint));

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
