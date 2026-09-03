import { type SVGProps } from 'react';

import { type IconName } from './generated/icon-names';
import svgSpriteHref from './generated/icons-svg-sprite.svg';

export function Icon({
  ref,
  icon,
  ...props
}: SVGProps<SVGSVGElement> & { icon: IconName; ref?: React.Ref<SVGSVGElement> }) {
  return (
    <svg {...props} ref={ref}>
      <use href={`${svgSpriteHref}#${icon}`} />
    </svg>
  );
}

export type IconProps = React.ComponentProps<typeof Icon>;
