import { TranslationObject } from '@app-builder/types/i18n';
import { getCurrentBrowser } from '@app-builder/utils/browser';
import { Trans } from 'react-i18next';

import { ExternalLink } from '../ExternalLink';

export function PopupBlockedError({
  translationObject,
}: {
  translationObject: TranslationObject<['common']>;
}) {
  const { tCommon } = translationObject;
  return (
    <div>
      <Trans
        t={tCommon}
        i18nKey="errors.popup_blocked_by_client"
        components={{
          EnablePopup: <EnablePopup />,
        }}
      />
    </div>
  );
}
const hrefMap = {
  Safari: 'https://support.apple.com/guide/safari/sfri40696/mac',
  Firefox: 'https://support.mozilla.org/en-US/kb/pop-blocker-settings-exceptions-troubleshooting',
  Chrome: 'https://support.google.com/chrome/answer/95472',
};

function EnablePopup({ children }: { children?: React.ReactNode }) {
  const browser = getCurrentBrowser(navigator.userAgent);
  if (browser in hrefMap) {
    return <ExternalLink href={hrefMap[browser as keyof typeof hrefMap]}>{children}</ExternalLink>;
  }
  return <span>{children}</span>;
}
