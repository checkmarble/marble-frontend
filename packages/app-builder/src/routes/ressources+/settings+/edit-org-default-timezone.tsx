import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelectWithCombobox } from '@app-builder/components/Form/FormSelectWithCombobox';
import { Highlight } from '@app-builder/components/Highlight';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { UTC, validTimezones } from '@app-builder/utils/validTimezones';
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';
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
  currentTimezone: string | null;
}) {
  const { t } = useTranslation(['settings']);

  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    defaultValue: {
      organizationId,
      timezone: currentTimezone || UTC,
    },
    lastResult: fetcher.data,
    constraint: getZodConstraint(schema),
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
          name={fields.timezone.name}
          className="flex flex-row items-center justify-between"
          description={t('settings:scenario_default_timezone.change_warning')}
        >
          <div>
            <FormLabel className="font-semibold first-letter:capitalize">
              {t('settings:scenario_default_timezone.label')}
            </FormLabel>
            <FormErrorOrDescription descriptionClassName="text-s text-red-47" />
          </div>
          <FormSelectWithCombobox.Control
            multiple={false}
            options={validTimezones}
            render={({ selectedValue }) => (
              <FormSelectTimezone
                selectedTimezone={selectedValue}
                validTimezones={validTimezones}
                onSelectedValueChange={(timezone) => {
                  if (currentTimezone !== timezone)
                    formRef.current?.requestSubmit();
                }}
              />
            )}
          />
        </FormField>
      </fetcher.Form>
    </FormProvider>
  );
}

const MAX_TIMEZONE_MATCHES = 50;

function FormSelectTimezone({
  selectedTimezone,
  validTimezones,
  onSelectedValueChange,
}: {
  selectedTimezone?: string;
  validTimezones: string[];
  onSelectedValueChange?: (selectedTimezone: string) => void;
}) {
  const { t } = useTranslation(['settings']);
  const [searchValue, setSearchValue] = React.useState('');
  const deferredSearchValue = React.useDeferredValue(searchValue);

  const matches = React.useMemo(
    () => matchSorter(validTimezones, deferredSearchValue),
    [validTimezones, deferredSearchValue],
  );

  return (
    <FormSelectWithCombobox.Root
      selectedValue={selectedTimezone}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSelectedValueChange={onSelectedValueChange}
    >
      <FormSelectWithCombobox.Select className="w-fit">
        {selectedTimezone}
        <FormSelectWithCombobox.Arrow />
      </FormSelectWithCombobox.Select>
      <FormSelectWithCombobox.Popover
        className="z-50 flex flex-col gap-2 p-2"
        unmountOnHide
      >
        <FormSelectWithCombobox.Combobox
          render={<Input className="shrink-0" />}
          autoSelect
          autoFocus
        />
        <FormSelectWithCombobox.ComboboxList>
          {matches.slice(0, MAX_TIMEZONE_MATCHES).map((tz) => (
            <FormSelectWithCombobox.ComboboxItem key={tz} value={tz}>
              <Highlight text={tz} query={deferredSearchValue} />
            </FormSelectWithCombobox.ComboboxItem>
          ))}
          {matches.length === 0 ? (
            <p className="text-s text-grey-50 flex items-center justify-center p-2">
              {t('settings:scenario_default_timezone.no_match')}
            </p>
          ) : null}
          {matches.length > MAX_TIMEZONE_MATCHES ? (
            <p className="text-s text-grey-50 flex items-center justify-center whitespace-pre-wrap text-balance p-2 text-center">
              {t('settings:scenario_default_timezone.more_results', {
                count: matches.length - MAX_TIMEZONE_MATCHES,
              })}
            </p>
          ) : null}
        </FormSelectWithCombobox.ComboboxList>
      </FormSelectWithCombobox.Popover>
    </FormSelectWithCombobox.Root>
  );
}
