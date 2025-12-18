import { listOrganizationFeatures, patchOrganizationFeatures } from '@bo/data/organization';
import {
  FeatureValue,
  OVERRIDABLE_FEATURES,
  PatchOrganizationFeaturesPayload,
  patchOrganizationFeaturesPayloadSchema,
} from '@bo/schemas/features';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { FeatureAccessDto } from 'marble-api/generated/backoffice-api';
import { FormEvent, ReactNode } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { Button, Radio } from 'ui-design-system';
import { SuspenseQuery } from '../core/SuspenseQuery';

const humanizeFeatureName = (featureName: string) =>
  featureName
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.substring(1))
    .join(' ');

export const OrganizationFeaturesPage = ({ orgId }: { orgId: string }) => {
  return (
    <div className="bg-surface-card border border-grey-border rounded-v2-md p-v2-lg">
      <SuspenseQuery
        query={listOrganizationFeatures(orgId)}
        errorComponent={() => null}
        fallback={<span>Loading...</span>}
      >
        {(featureAccess) => <FeaturesForm orgId={orgId} featureAccess={featureAccess} />}
      </SuspenseQuery>
    </div>
  );
};

const FeaturesForm = ({ orgId, featureAccess }: { orgId: string; featureAccess: FeatureAccessDto }) => {
  const patchOrganizationFeaturesMutation = useMutation(patchOrganizationFeatures());

  const form = useForm({
    defaultValues: Object.fromEntries(
      Object.entries(featureAccess).filter(([key, _]) =>
        OVERRIDABLE_FEATURES.includes(key as (typeof OVERRIDABLE_FEATURES)[number]),
      ),
    ) as PatchOrganizationFeaturesPayload,
    validators: {
      onSubmit: patchOrganizationFeaturesPayloadSchema,
      onChange: patchOrganizationFeaturesPayloadSchema,
      onMount: patchOrganizationFeaturesPayloadSchema,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        patchOrganizationFeaturesMutation.mutateAsync({ orgId, features: value });
      }
    },
  });

  // TODO: Make a util in @marble/shared
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  return (
    <form className="grid grid-cols-[200px_1fr] gap-v2-md gap-y-v2-sm" onSubmit={handleSubmit}>
      {OVERRIDABLE_FEATURES.map((featureName) => {
        return (
          <form.Field name={featureName} key={featureName}>
            {(field) => (
              <Fragment>
                <div>{humanizeFeatureName(field.name)}</div>
                <Radio.Root
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as FeatureValue)}
                  className="flex-row items-center gap-v2-sm"
                >
                  <RadioLabel>
                    <Radio.Item value="restricted" />
                    Restricted
                  </RadioLabel>
                  <RadioLabel>
                    <Radio.Item value="test" />
                    Test
                  </RadioLabel>
                  <RadioLabel>
                    <Radio.Item value="allowed" />
                    Allowed
                  </RadioLabel>
                </Radio.Root>
              </Fragment>
            )}
          </form.Field>
        );
      })}
      <form.Subscribe selector={(state) => [state.canSubmit, state.isDirty]}>
        {([canSubmit, isDirty]) => (
          <Button type="submit" disabled={!canSubmit || !isDirty}>
            Save
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

const RadioLabel = ({ children }: { children: ReactNode }) => {
  return <label className="flex flex-row items-center gap-v2-xs px-v2-sm py-v2-xs rounded-v2-md">{children}</label>;
};
