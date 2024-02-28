import { getCurrentBrowser } from '@app-builder/utils/browser';
import { Trans, useTranslation } from 'react-i18next';

export function PopupBlockedError() {
  const { t } = useTranslation(['common']);
  return (
    <div>
      <Trans
        t={t}
        i18nKey="common:errors.popup_blocked_by_client"
        components={{
          EnablePopup: <EnablePopup />,
        }}
      />
    </div>
  );
}

const hrefMap = {
  Safari: 'https://support.apple.com/guide/safari/sfri40696/mac',
  Firefox:
    'https://support.mozilla.org/en-US/kb/pop-blocker-settings-exceptions-troubleshooting',
  Chrome: 'https://support.google.com/chrome/answer/95472',
};

function EnablePopup({ children }: { children?: React.ReactNode }) {
  const browser = getCurrentBrowser(navigator.userAgent);
  if (browser in hrefMap) {
    return (
      <a
        href={hrefMap[browser as keyof typeof hrefMap]}
        target="_blank"
        rel="noreferrer noopener"
        className="text-purple-100 hover:underline"
      >
        {children}
      </a>
    );
  }
  return <span>{children}</span>;
}
