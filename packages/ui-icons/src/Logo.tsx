import { type SVGProps } from 'react';

import { type LogoName } from './generated/logo-names';
import svgSpriteHref from './generated/logos-svg-sprite.svg';

export function Logo({
  logo,
  ...props
}: SVGProps<SVGSVGElement> & { logo: LogoName }) {
  return (
    <svg {...props}>
      <use href={`${svgSpriteHref}#${logo}`} />
    </svg>
  );
}
