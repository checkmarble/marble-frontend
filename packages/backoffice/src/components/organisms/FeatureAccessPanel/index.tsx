import { makeQueryErrorComponent } from '@bo/components/common/ErrorComponent';
import { SuspenseQuery } from '@bo/components/core/SuspenseQuery';
import { listOrganizationFeatures, patchOrganizationFeatures } from '@bo/data/organization';
import {
  type FeatureValue,
  OVERRIDABLE_FEATURES,
  type PatchOrganizationFeaturesPayload,
  patchOrganizationFeaturesPayloadSchema,
} from '@bo/schemas/features';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { FeatureAccessDto } from 'marble-api/generated/backoffice-api';
import { cn, Panel } from 'ui-design-system';

const FormError = makeQueryErrorComponent(
  <span className="text-grey-secondary text-s">Could not load feature access.</span>,
);

type FeatureAccessPanelProps = {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeatureAccessPanel({ orgId, open, onOpenChange }: FeatureAccessPanelProps) {
  return (
    <Panel.Root open={open} onOpenChange={onOpenChange}>
      <Panel.Container size="small">
        <Panel.Content>
          <Panel.Header>
            <div className="flex flex-col">
              <span>Feature access</span>
              <p className="text-grey-secondary text-small font-normal">
                Set which capabilities this organization can use.
              </p>
            </div>
          </Panel.Header>
          <SuspenseQuery
            query={listOrganizationFeatures(orgId)}
            fallback={<FeaturesFormSkeleton />}
            errorComponent={FormError}
          >
            {(featureAccess) => (
              <FeaturesForm orgId={orgId} featureAccess={featureAccess} onSaved={() => onOpenChange(false)} />
            )}
          </SuspenseQuery>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

const FEATURE_LABELS: Record<(typeof OVERRIDABLE_FEATURES)[number], string> = {
  test_run: 'Test run',
  sanctions: 'Sanctions',
  case_auto_assign: 'Case auto-assign',
  case_ai_assist: 'Case AI assist',
  continuous_screening: 'Continuous screening',
  ai_rule_building: 'AI Rule building',
  lexisnexis: 'Lexis Nexis',
};

const ACCESS_LEVELS: { value: FeatureValue; label: string; dot: string }[] = [
  { value: 'restricted', label: 'Restricted', dot: 'bg-grey-disabled' },
  { value: 'test', label: 'Test', dot: 'bg-yellow-primary' },
  { value: 'allowed', label: 'Allowed', dot: 'bg-green-primary' },
];

const FORM_ID = 'feature-access-form';

function FeaturesForm({
  orgId,
  featureAccess,
  onSaved,
}: {
  orgId: string;
  featureAccess: FeatureAccessDto;
  onSaved: () => void;
}) {
  const patchMutation = useMutation(patchOrganizationFeatures());

  const form = useForm({
    defaultValues: Object.fromEntries(
      OVERRIDABLE_FEATURES.map((feature) => [feature, featureAccess[feature]]),
    ) as PatchOrganizationFeaturesPayload,
    validators: {
      onMount: patchOrganizationFeaturesPayloadSchema,
      onChange: patchOrganizationFeaturesPayloadSchema,
      onSubmit: patchOrganizationFeaturesPayloadSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;
      await patchMutation.mutateAsync({ orgId, features: value });
      onSaved();
    },
  });

  return (
    <>
      <form
        id={FORM_ID}
        className="flex flex-col divide-y divide-grey-border"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        {OVERRIDABLE_FEATURES.map((feature) => (
          <form.Field key={feature} name={feature}>
            {(field) => (
              <div className="flex items-center justify-between gap-md py-md first:pt-0">
                <span className="text-grey-primary text-s font-medium">{FEATURE_LABELS[feature]}</span>
                <AccessSegmentedControl
                  label={FEATURE_LABELS[feature]}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                />
              </div>
            )}
          </form.Field>
        ))}
      </form>

      <Panel.Footer>
        <Panel.FooterButton isCloseButton label="Cancel" />
        <form.Subscribe selector={(state) => [state.canSubmit, state.isDirty]}>
          {([canSubmit, isDirty]) => (
            <Panel.FooterButton
              type="submit"
              form={FORM_ID}
              label="Save changes"
              variant="primary"
              disabled={!canSubmit || !isDirty}
              isLoading={patchMutation.isPending}
            />
          )}
        </form.Subscribe>
      </Panel.Footer>
    </>
  );
}

function AccessSegmentedControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: FeatureValue | undefined;
  onChange: (value: FeatureValue) => void;
}) {
  return (
    <div
      role="group"
      aria-label={`${label} access level`}
      className="border-grey-border bg-grey-background inline-flex shrink-0 items-center gap-0.5 rounded-lg border p-0.5"
    >
      {ACCESS_LEVELS.map((level) => {
        const active = value === level.value;
        return (
          <button
            key={level.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(level.value)}
            className={cn(
              'flex items-center gap-xs rounded-md px-sm py-xs text-xs font-medium transition-all',
              active
                ? 'bg-surface-card text-grey-primary shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)]'
                : 'text-grey-secondary hover:text-grey-primary',
            )}
          >
            <span className={cn('size-1.5 rounded-full transition-opacity', level.dot, !active && 'opacity-40')} />
            {level.label}
          </button>
        );
      })}
    </div>
  );
}

function FeaturesFormSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-grey-border">
      {Array.from({ length: OVERRIDABLE_FEATURES.length }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-md py-md first:pt-0">
          <div className="bg-grey-background-light h-4 w-32 animate-pulse rounded" />
          <div className="bg-grey-background-light h-9 w-56 animate-pulse rounded-lg" />
        </div>
      ))}
    </div>
  );
}
