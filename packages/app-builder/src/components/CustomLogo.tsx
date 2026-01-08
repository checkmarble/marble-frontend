import { getClientEnv } from '@app-builder/utils/environment';
import { type ComponentProps } from 'react';
import { Logo, type LogoName } from 'ui-icons';

type LogoProps = ComponentProps<typeof Logo>;

interface CustomLogoProps extends Omit<LogoProps, 'logo'> {
  logo: LogoName;
  /** Alt text for custom logo image */
  alt?: string;
  /** If true, hides this logo when a custom logo is configured */
  hideWhenCustom?: boolean;
  /** Alternative className to use when displaying a custom logo */
  customLogoClassName?: string;
}

/**
 * Logo component that supports white-labeling via CUSTOM_LOGO_URL environment variable.
 * When CUSTOM_LOGO_URL is set, displays the custom image instead of the default Marble logo.
 */
export function CustomLogo({
  logo,
  alt = 'Logo',
  className,
  hideWhenCustom,
  customLogoClassName,
  ...props
}: CustomLogoProps) {
  const customLogoUrl = getClientEnv('CUSTOM_LOGO_URL');

  if (customLogoUrl) {
    if (hideWhenCustom) {
      return null;
    }
    return <img src={customLogoUrl} alt={alt} className={customLogoClassName ?? className} />;
  }

  return <Logo logo={logo} className={className} {...props} />;
}
