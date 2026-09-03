import { type SVGProps } from 'react';

import { type LogoName } from './generated/logo-names';
import svgSpriteHref from './generated/logos-svg-sprite.svg';

export function Logo({
  ref,
  logo,
  ...props
}: SVGProps<SVGSVGElement> & { logo: LogoName; ref?: React.Ref<SVGSVGElement> }) {
  return (
    <svg {...props} ref={ref}>
      <use href={`${svgSpriteHref}#${logo}`} />
    </svg>
  );
}

export type LogoProps = React.ComponentProps<typeof Logo>;
