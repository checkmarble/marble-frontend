import { FormError } from '@app-builder/components/Form/Tanstack/FormError';
import { Page } from '@app-builder/components/Page';
import { CollapsiblePaper } from '@app-builder/components/Paper';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  updateAllowedNetworksPayloadSchema,
  useUpdateAllowedNetworks,
} from '@app-builder/queries/settings/organization/update-allowed-networks';
import { handleSubmit } from '@app-builder/utils/form';
import { isMutationSuccess } from '@app-builder/utils/http/mutation';
import { useForm, useStore } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, ButtonV2, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ConfirmSaveModal } from './ConfirmSaveModal';

export const IpWhitelistingSettingsPage = ({
  allowedNetworks,
  organizationId,
}: {
  allowedNetworks: string[];
  organizationId: string;
}) => {
  const { t } = useTranslation(['common', 'settings']);
  const updateAllowedNetworksMutation = useUpdateAllowedNetworks(organizationId);
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      allowedNetworks,
    },
    onSubmit: ({ value }) => {
      updateAllowedNetworksMutation.mutateAsync(value).then((res) => {
        if (isMutationSuccess(res)) {
          // Manually update the form value as the backend registers normalized values of cidr/ips
          form.setFieldValue('allowedNetworks', res.data.subnets);
        }
        revalidate();
      });
    },
    validators: {
      onSubmit: updateAllowedNetworksPayloadSchema,
    },
  });

  const removedNetworks = useStore(form.store, (state) => R.difference(allowedNetworks, state.values.allowedNetworks));

  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:ip_whitelisting')}</span>
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                form.reset();
              }}
            >
              {t('settings:ip_whitelisting.reset')}
            </Button>
            {removedNetworks.length > 0 ? (
              <ConfirmSaveModal onConfirm={() => form.handleSubmit()}>
                <Button onClick={(e) => e.stopPropagation()}>{t('settings:ip_whitelisting.save')}</Button>
              </ConfirmSaveModal>
            ) : (
              <Button type="submit" form="ip-whitelisting-form" onClick={(e) => e.stopPropagation()}>
                {t('settings:ip_whitelisting.save')}
              </Button>
            )}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <form
              onSubmit={handleSubmit(form)}
              className="grid grid-cols-[300px_1fr] gap-v2-sm items-center"
              id="ip-whitelisting-form"
            >
              <form.Field name="allowedNetworks" mode="array">
                {(networksField) => (
                  <>
                    {networksField.state.value.map((_, idx) => (
                      <form.Field key={idx} name={`allowedNetworks[${idx}]`}>
                        {(field) => (
                          <>
                            <Input
                              value={field.state.value}
                              onChange={(e) => {
                                field.handleChange(e.target.value);
                                networksField.validate('change');
                              }}
                              placeholder={t('settings:ip_whitelisting.placeholder')}
                            />
                            <div className="flex items-center gap-v2-sm">
                              <ButtonV2 mode="icon" variant="secondary" onClick={() => networksField.removeValue(idx)}>
                                <Icon
                                  icon="delete"
                                  className={'size-3.5 shrink-0 cursor-pointer'}
                                  aria-label={t('settings:ip_whitelisting.delete')}
                                />
                              </ButtonV2>
                              <FormError
                                field={field}
                                asString
                                translations={{
                                  invalid_union: t('settings:ip_whitelisting.add_new.error'),
                                }}
                              />
                            </div>
                          </>
                        )}
                      </form.Field>
                    ))}
                    <div className="flex gap-v2-md items-center col-span-full">
                      <Button className="w-fit" onClick={() => networksField.pushValue('')}>
                        <Icon icon="plus" className="size-3.5 shrink-0 cursor-pointer" />
                        {t('settings:ip_whitelisting.add_new')}
                      </Button>
                    </div>
                    <FormError field={networksField} className="col-span-full" />
                  </>
                )}
              </form.Field>
            </form>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
};
