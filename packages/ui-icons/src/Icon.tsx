import { type SVGProps } from 'react';

import { type IconName } from './generated/icon-names';
import svgSpriteHref from './generated/icons-svg-sprite.svg';

export function Icon({
  icon,
  ...props
}: SVGProps<SVGSVGElement> & { icon: IconName }) {
  return (
    <svg {...props}>
      <use href={`${svgSpriteHref}#${icon}`} />
    </svg>
  );
}
