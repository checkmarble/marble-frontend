import { useTranslation } from 'react-i18next';
import { Callout } from '../Callout';

export function UnreadyCallout({ didMigrationsRun }: { didMigrationsRun: boolean }) {
  const { t } = useTranslation(['auth']);

  return (
    <Callout variant="soft" color="red" className="mb-6 text-start">
      <div>
        {didMigrationsRun
          ? t('auth:sign_up.warning.instance_not_initialized')
          : t('auth:sign_up.warning.database_not_migrated')}
        <p>
          {t('auth:sign_up.read_more')}
          <a
            href="https://github.com/checkmarble/marble/blob/main/installation/first_connection.md"
            className="text-purple-65 px-[1ch] underline"
          >
            {t('auth:sign_up.first_connection_guide')}
          </a>
        </p>
      </div>
    </Callout>
  );
}
