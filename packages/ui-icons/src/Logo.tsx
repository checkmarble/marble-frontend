import { forwardRef, type SVGProps } from 'react';

import { type LogoName } from './generated/logo-names';
import svgSpriteHref from './generated/logos-svg-sprite.svg';

export const Logo = forwardRef<
  SVGSVGElement,
  SVGProps<SVGSVGElement> & {
    logo: LogoName;
  }
>(function Logo({ logo, ...props }, ref) {
  return (
    <svg {...props} ref={ref}>
      <use href={`${svgSpriteHref}#${logo}`} />
    </svg>
  );
});

export type LogoProps = React.ComponentProps<typeof Logo>;
