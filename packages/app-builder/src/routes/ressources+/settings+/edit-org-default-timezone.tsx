import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { validTimezones } from '@app-builder/utils/validTimezones';
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const schema = z.object({
  organizationId: z.string().min(1),
  timezone: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { organization } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  await organization.updateOrganization({
    organizationId: submission.value.organizationId,
    defaultScenarioTimezone: submission.value.timezone,
  });

  return json(submission.reply());
}

export function EditOrgDefaultTimezone({
  organizationId,
  currentTimezone,
}: {
  organizationId: string;
  currentTimezone: string | undefined;
}) {
  const { t } = useTranslation(['settings']);

  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    defaultValue: {
      organizationId,
      timezone: currentTimezone || validTimezones[0],
    },
    lastResult: fetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema,
      });
    },
  });

  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        ref={formRef}
        method="post"
        className="col-span-2 grid grid-cols-subgrid"
        action={getRoute('/ressources/settings/edit-org-default-timezone')}
        {...getFormProps(form)}
      >
        <input
          {...getInputProps(fields.organizationId, { type: 'hidden' })}
          key={fields.organizationId.key}
        />
        <FormField
          name={'timezone'}
          className="flex flex-row items-center justify-between"
        >
          <div>
            <FormLabel className="font-semibold first-letter:capitalize">
              {t('settings:scenario_default_timezone.label')}
            </FormLabel>
            <p className="text-s text-red-100">
              {t('settings:scenario_default_timezone.change_warning')}
            </p>
          </div>
          <FormSelect.Default
            className="w-fit"
            onValueChange={() => {
              formRef.current?.requestSubmit();
            }}
            options={validTimezones}
          >
            {validTimezones.map((tz) => (
              <FormSelect.DefaultItem key={tz} value={tz}>
                {tz}
              </FormSelect.DefaultItem>
            ))}
          </FormSelect.Default>
        </FormField>
      </fetcher.Form>
    </FormProvider>
  );
}
