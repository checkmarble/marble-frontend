import { type SVGProps } from 'react';

import { type LogoName, logoViewBoxes } from './generated/logo-names';
import svgSpriteHref from './generated/logos-svg-sprite.svg';

export function Logo({
  ref,
  logo,
  ...props
}: SVGProps<SVGSVGElement> & { logo: LogoName; ref?: React.Ref<SVGSVGElement> }) {
  const { width, height } = logoViewBoxes[logo];

  return (
    <svg {...props} ref={ref} viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <use href={`${svgSpriteHref}#${logo}`} />
    </svg>
  );
}

export type LogoProps = React.ComponentProps<typeof Logo>;
