import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export function GraphAccessPlaceholder() {
  const { t } = useTranslation(['graph', 'common']);

  return (
    <div className="border-purple-border bg-purple-background-light flex flex-col items-center justify-center gap-sm rounded-lg border p-md py-sm text-center min-h-0 flex-1 max-h-min">
      <Icon icon="comet" className="size-10 shrink-0" />
      <span className="text-xs">{t('graph:access.title')}</span>
      <a
        href="https://checkmarble.com/upgrade"
        target="_blank"
        rel="noreferrer"
        className="border-purple-primary text-purple-primary text-xs font-medium w-full max-w-56 rounded-lg border py-xs text-center hover:bg-purple-primary/10 transition-colors"
      >
        {t('graph:access.upgrade')}
      </a>
    </div>
  );
}
