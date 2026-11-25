import { Callout } from '@app-builder/components/Callout';
import { type ApiKey } from '@app-builder/models/api-keys';
import {
  buildSsoRecoveryCurl,
  buildSsoUpdateCurl,
  type TenantOidcConfiguration,
} from '@app-builder/models/tenant-oidc';
import { useCreateSsoRecoveryKeyMutation } from '@app-builder/queries/settings/sso/create-sso-recovery-key';
import { handleSubmit } from '@app-builder/utils/form';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from '@tanstack/react-router';
import { Fragment, type ReactNode, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, CtaV2ClassName, cn, Modal, Tag } from 'ui-design-system';
import {
  SSO_HIGHLIGHTED_CARD_CLASSNAME,
  SsoCopyableValue,
  SsoCopyButton,
  SsoField,
  SsoReadOnlyInput,
  SsoSection,
  SsoTextField,
} from './SsoLayout';

type RecoveryKey = Pick<ApiKey, 'id' | 'description' | 'prefix' | 'createdAt'>;
type CreatedKey = { key: string; description: string };

/** The "Emergency access" card with the existing keys, then the card that creates one. */
export function SsoRecoveryKeyCard({
  apiUrl,
  tenantId,
  configuration,
  recoveryKeys,
}: {
  apiUrl: string | null;
  tenantId: string;
  configuration: TenantOidcConfiguration | null;
  /** `null` when the list could not be read. */
  recoveryKeys: RecoveryKey[] | null;
}) {
  const { t } = useTranslation(['settings']);
  const router = useRouter();
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);
  // The list only shows a new key once the user confirms storing it, and can be unreadable.
  const [hasCreatedKey, setHasCreatedKey] = useState(false);
  const hasKey = hasCreatedKey || (recoveryKeys?.length ?? 0) > 0;

  return (
    <>
      <SsoSection
        title={t('settings:sso.recovery.title')}
        tag={
          <Tag color={hasKey ? 'green' : 'orange'}>
            {hasKey ? t('settings:sso.recovery.key_created') : t('settings:sso.recovery.recommended')}
          </Tag>
        }
        description={t('settings:sso.recovery.description')}
      >
        {recoveryKeys && recoveryKeys.length > 0 ? <RecoveryKeyList recoveryKeys={recoveryKeys} /> : null}
        {recoveryKeys?.length === 0 && !hasCreatedKey ? (
          <Callout variant="outlined" color="orange" icon="warning" iconColor="orange">
            {t('settings:sso.recovery.none')}
          </Callout>
        ) : null}
      </SsoSection>

      <SsoSection
        title={t('settings:sso.recovery.create_card.title')}
        description={t('settings:sso.recovery.create_card.description')}
      >
        {createdKey ? (
          <CreatedRecoveryKey createdKey={createdKey} />
        ) : (
          <CreateRecoveryKeyForm
            onCreated={(created) => {
              setCreatedKey(created);
              setHasCreatedKey(true);
            }}
          />
        )}
        <RecoveryCommand
          title={t('settings:sso.recovery.example.title')}
          description={t('settings:sso.recovery.example.description')}
          curl={buildSsoRecoveryCurl({ apiUrl, tenantId, apiKey: createdKey?.key })}
        />
        <RecoveryCommand
          title={t('settings:sso.recovery.update_example.title')}
          description={t('settings:sso.recovery.update_example.description')}
          curl={buildSsoUpdateCurl({ apiUrl, tenantId, configuration })}
        >
          <UpdateFields />
        </RecoveryCommand>
        {createdKey ? (
          <StoredKeyConfirmation
            onStored={() => {
              setCreatedKey(null);
              // Reloading while the key is shown could swap the page for an error and lose the key.
              void router.invalidate();
            }}
          />
        ) : null}
      </SsoSection>
    </>
  );
}

function RecoveryKeyList({ recoveryKeys }: { recoveryKeys: RecoveryKey[] }) {
  const { t } = useTranslation(['settings']);
  const formatDateTime = useFormatDateTime();

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center justify-between gap-sm">
        <span className="text-2xs text-grey-primary">{t('settings:sso.recovery.existing_keys')}</span>
        <Link to="/settings/api-keys" className={CtaV2ClassName({ variant: 'primary', appearance: 'link' })}>
          {t('settings:sso.recovery.manage_keys')}
        </Link>
      </div>
      <ul className="flex flex-col gap-sm">
        {recoveryKeys.map((recoveryKey) => (
          <li
            key={recoveryKey.id}
            className="bg-grey-background-light flex min-h-8 items-center gap-sm rounded-md px-sm py-2xs"
          >
            <span dir="auto" className="text-small text-grey-primary min-w-0 flex-1 truncate font-medium">
              {recoveryKey.description}
            </span>
            <span dir="ltr" className="text-xs text-grey-secondary font-mono">
              {`${recoveryKey.prefix}*************`}
            </span>
            {recoveryKey.createdAt ? (
              <span className="text-xs text-grey-secondary">
                {formatDateTime(recoveryKey.createdAt, { dateStyle: 'medium' })}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreateRecoveryKeyForm({ onCreated }: { onCreated: (created: CreatedKey) => void }) {
  const { t } = useTranslation(['common', 'settings']);
  const createMutation = useCreateSsoRecoveryKeyMutation();

  const form = useForm({
    defaultValues: { description: t('settings:sso.recovery.key_name_default') },
    onSubmit: async ({ value }) => {
      try {
        const result = await createMutation.mutateAsync(value);
        if (!result) return;
        if (!result.success) {
          toast.error(
            result.error === 'forbidden' ? t('settings:sso.recovery.errors.forbidden') : t('common:errors.unknown'),
          );
          return;
        }
        onCreated({ key: result.key, description: value.description.trim() });
      } catch {
        toast.error(t('common:errors.unknown'));
      }
    },
  });

  return (
    <form onSubmit={handleSubmit(form)} className="flex flex-col gap-md" noValidate>
      <div className="grid grid-cols-2 gap-md">
        <form.Field
          name="description"
          validators={{
            onSubmit: ({ value }) =>
              value.trim() ? undefined : { message: t('settings:sso.recovery.key_name.required') },
          }}
        >
          {(field) => (
            <SsoTextField
              field={field}
              id="sso-recovery-key-name"
              label={t('settings:sso.recovery.key_name')}
              // A free-text name follows the page direction, unlike the connection fields.
              dir={undefined}
            />
          )}
        </form.Field>
      </div>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" variant="primary" appearance="stroked" disabled={isSubmitting}>
            {t('settings:sso.recovery.create')}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

function CreatedRecoveryKey({ createdKey }: { createdKey: CreatedKey }) {
  const { t } = useTranslation(['settings']);

  return (
    <>
      <Callout variant="outlined" color="orange" iconColor="orange">
        {t('settings:sso.recovery.copy_now')}
      </Callout>
      <div className="grid grid-cols-2 gap-md">
        <SsoField id="sso-recovery-key-name" label={t('settings:sso.recovery.key_name')}>
          <SsoReadOnlyInput id="sso-recovery-key-name" value={createdKey.description} />
        </SsoField>
      </div>
      <SsoField id="sso-recovery-key" label={t('settings:sso.recovery.api_key')}>
        <SsoCopyableValue id="sso-recovery-key" value={createdKey.key} />
      </SsoField>
    </>
  );
}

function StoredKeyConfirmation({ onStored }: { onStored: () => void }) {
  const { t } = useTranslation(['common', 'settings']);

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button className="self-start">{t('settings:sso.recovery.stored')}</Button>
      </Modal.Trigger>
      <Modal.Content size="small">
        <Modal.Title>{t('settings:sso.recovery.confirm.title')}</Modal.Title>
        <Modal.Description className="text-s text-grey-primary p-md">
          {t('settings:sso.recovery.confirm.description')}
        </Modal.Description>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:go_back')} />
          <Modal.FooterButton label={t('settings:sso.recovery.confirm.submit')} onClick={onStored} />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

function RecoveryCommand({
  title,
  description,
  curl,
  children,
}: {
  title: string;
  description: string;
  curl: string;
  children?: ReactNode;
}) {
  const { t } = useTranslation(['common']);

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-col gap-xs">
        <h4 className="text-xs text-grey-primary font-medium">{title}</h4>
        <p className="text-xs text-grey-primary">{description}</p>
      </div>
      <div className={cn(SSO_HIGHLIGHTED_CARD_CLASSNAME, 'flex items-start gap-sm')}>
        <pre dir="ltr" className="text-xs text-grey-primary min-w-0 flex-1 overflow-x-auto font-mono leading-5">
          {curl}
        </pre>
        <SsoCopyButton value={curl} label={`${t('common:copy')} – ${title}`} />
      </div>
      {children}
    </div>
  );
}

// Every field the PUT body accepts, in the command's order. Field names are API names: never translated.
const UPDATE_FIELDS = [
  ['issuer', 'settings:sso.recovery.update_example.fields.issuer'],
  ['client_id', 'settings:sso.recovery.update_example.fields.client_id'],
  ['client_secret', 'settings:sso.recovery.update_example.fields.client_secret'],
  ['scopes', 'settings:sso.recovery.update_example.fields.scopes'],
  ['extra_params', 'settings:sso.recovery.update_example.fields.extra_params'],
  ['email_claim', 'settings:sso.recovery.update_example.fields.email_claim'],
  ['sso_enabled', 'settings:sso.recovery.update_example.fields.sso_enabled'],
] as const;

function UpdateFields() {
  const { t } = useTranslation(['settings']);

  return (
    <dl className="text-xs text-grey-primary grid grid-cols-[max-content_minmax(0,1fr)] gap-x-md gap-y-xs">
      {UPDATE_FIELDS.map(([field, key]) => (
        <Fragment key={field}>
          <dt className="font-mono font-medium">{field}</dt>
          <dd>{t(key)}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
