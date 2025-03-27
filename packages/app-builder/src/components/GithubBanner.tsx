import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const GithubBanner = () => {
  const [isShown, setVisibility] = useState(
    (localStorage.getItem('show-github-banner') as 'true' | 'false') ?? 'true',
  );

  const { t } = useTranslation(['common']);

  return isShown === 'true' ? (
    <div className="text-s border-purple-96 bg-purple-98 text-purple-65 sticky bottom-0 mt-auto flex w-full flex-row justify-between gap-2 border-y px-8 py-2">
      <div className="flex w-full flex-row items-center gap-2">
        <Icon icon="notifications" className="size-5" />
        <span>
          <span>{t('common:github_banner')} </span>
          <a
            href="https://github.com/checkmarble/marble"
            className="underline"
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              localStorage.setItem('show-github-banner', 'false');
              setVisibility('false');
            }}
          >
            Github
          </a>
        </span>
      </div>
      <Icon
        icon="cross"
        className="size-6 hover:cursor-pointer"
        onClick={() => {
          localStorage.setItem('show-github-banner', 'false');
          setVisibility('false');
        }}
      />
    </div>
  ) : null;
};
