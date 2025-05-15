import { forwardRef, type SVGProps } from 'react';

import type { IconName } from './generated/icon-names';
import svgSpriteHref from './generated/icons-svg-sprite.svg';

export const Icon = forwardRef<
  SVGSVGElement,
  SVGProps<SVGSVGElement> & {
    icon: IconName;
  }
>(function Icon({ icon, ...props }, ref) {
  return (
    <svg {...props} ref={ref}>
      <use href={`${svgSpriteHref}#${icon}`} />
    </svg>
  );
});

export type IconProps = React.ComponentProps<typeof Icon>;
