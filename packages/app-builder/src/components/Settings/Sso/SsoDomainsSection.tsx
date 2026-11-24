import { Callout } from '@app-builder/components/Callout';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { type TenantDomain } from '@app-builder/models/tenant-oidc';
import { useAddSsoDomainMutation } from '@app-builder/queries/settings/sso/add-sso-domain';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { SsoSection } from './SsoLayout';

export function SsoDomainsSection({
  domains,
  verifiedDomains,
}: {
  domains: TenantDomain[];
  verifiedDomains: string[];
}) {
  const { t } = useTranslation(['settings']);

  return (
    <SsoSection title={t('settings:sso.domains.title')} description={t('settings:sso.domains.description')}>
      <div className="grid grid-cols-2 gap-md">
        <div className="flex flex-col gap-sm">
          {domains.length === 0 ? (
            <p className="text-xs text-grey-secondary">{t('settings:sso.domains.empty')}</p>
          ) : (
            <div className="flex flex-col gap-xs">
              <span className="text-2xs text-grey-primary">{t('settings:sso.domains.domain')}</span>
              <ul className="grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-sm">
                {domains.map((domain) => {
                  const verified = domain.verifiedAt !== null;
                  return (
                    <li key={domain.id} className="contents">
                      <span
                        dir="ltr"
                        className="bg-grey-background-light text-small text-grey-primary flex h-8 min-w-0 items-center truncate rounded-md px-sm font-medium"
                      >
                        {domain.domain}
                      </span>
                      <Tag color={verified ? 'green' : 'orange'} className="justify-self-start">
                        {verified ? t('settings:sso.domains.verified') : t('settings:sso.domains.pending')}
                      </Tag>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <AddSsoDomain />
        </div>
      </div>
      {verifiedDomains.length > 0 ? null : (
        <Callout variant="outlined" color="orange" icon="warning" iconColor="orange">
          {t('settings:sso.domains.none_verified')}
        </Callout>
      )}
    </SsoSection>
  );
}

const ADD_DOMAIN_ERROR_KEYS = {
  invalid: 'settings:sso.domains.errors.invalid',
  duplicate: 'settings:sso.domains.errors.duplicate',
  forbidden: 'settings:sso.domains.errors.forbidden',
  unknown: 'common:errors.unknown',
} as const;

function AddSsoDomain() {
  const { t } = useTranslation(['common', 'settings']);
  const router = useRouter();
  const addMutation = useAddSsoDomainMutation();
  const [domain, setDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const canAdd = domain.trim() !== '' && !addMutation.isPending;

  const add = async () => {
    if (!canAdd) return;
    try {
      const result = await addMutation.mutateAsync({ domain });
      if (!result) return;
      if (!result.success) {
        const message = t(ADD_DOMAIN_ERROR_KEYS[result.error]);
        if (result.error === 'invalid' || result.error === 'duplicate') setError(message);
        else toast.error(message);
        return;
      }
      setDomain('');
      toast.success(t('settings:sso.domains.added'));
      await router.invalidate();
    } catch {
      toast.error(t('common:errors.unknown'));
    }
  };

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center gap-sm">
        <Input
          size="medium"
          dir="ltr"
          className="min-w-0 flex-1"
          inputClassName="text-start"
          placeholder="example.com"
          aria-label={t('settings:sso.domains.domain')}
          value={domain}
          onChange={(e) => {
            setDomain(e.currentTarget.value);
            setError(null);
          }}
          // The field sits inside the connection form: Enter adds the domain instead of saving the configuration.
          onEnterKeyDown={(e) => {
            e.preventDefault();
            void add();
          }}
          aria-invalid={error ? true : undefined}
          borderColor={error ? 'redfigma-47' : 'greyfigma-90'}
        />
        <Button
          mode="icon"
          size="medium"
          variant="primary"
          appearance="stroked"
          aria-label={t('settings:sso.domains.add')}
          disabled={!canAdd}
          onClick={() => void add()}
        >
          <Icon icon="plus" className="size-5" />
        </Button>
      </div>
      <FormErrorOrDescription errors={error ? [error] : undefined} />
    </div>
  );
}
