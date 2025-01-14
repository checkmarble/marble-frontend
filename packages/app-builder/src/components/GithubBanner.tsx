import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const GithubBanner = () => {
  const [isShown, setVisibility] = useState(
    (localStorage.getItem('show-github-banner') as 'true' | 'false') ?? 'true',
  );

  const { t } = useTranslation(['common']);

  return isShown === 'true' ? (
    <div className="text-s text-grey-00 absolute left-0 top-0 flex w-full flex-row justify-between gap-2 bg-purple-100 p-4 font-normal">
      <div className="flex w-full flex-row items-center gap-4">
        <Icon icon="notifications" className="size-6" />
        <span className="inline-flex gap-1 font-semibold">
          <span>{t('common:github_banner')}</span>
          <a
            href="https://github.com/checkmarble/marble"
            className="underline"
            target="_blank"
            rel="noreferrer"
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
