import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { useForm } from '@tanstack/react-form';
import { Client360Table } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

type SearchFormProps = {
  table: Client360Table;
};

const searchFormSchema = z.object({
  value: z.union([z.uuid(), z.string().min(2)]),
});

export const SearchForm = ({ table }: SearchFormProps) => {
  const { t } = useTranslation(['client360']);
  const navigate = useAgnosticNavigation();

  const form = useForm({
    defaultValues: {
      value: '',
    },
    validators: {
      onSubmit: searchFormSchema,
      onChange: searchFormSchema,
      onMount: searchFormSchema,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        const trimmedValue = value.value.trim();
        if (z.uuid().safeParse(trimmedValue).success) {
          navigate(
            getRoute('/client-detail/:objectType/:objectId', { objectType: table.name, objectId: trimmedValue }),
          );
        } else {
          navigate({ pathname: getRoute('/client-detail'), search: `?table=${table.name}&terms=${value.value}` });
        }
      }
    },
  });

  return (
    <form className="flex flex-col gap-v2-sm" onSubmit={handleSubmit(form)}>
      <label htmlFor={`search_${table.id}`} className="flex items-center gap-v2-sm">
        <span className="font-medium">
          {t('client360:client_detail.search_form.search_by', { name: (table.alias ?? table.name).toLowerCase() })}
        </span>
        {!table.ready ? (
          <span className="text-grey-text text-small flex items-center gap-v2-xs">
            <Icon icon="warning" className="size-4 text-yellow-primary" />{' '}
            {t('client360:client_detail.search_form.table_not_ready')}
          </span>
        ) : null}
      </label>
      <div className="flex items-center gap-v2-sm">
        <form.Field name="value">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              startAdornment="search"
              placeholder={`${table.alias || table.name}...`}
              className="grow"
              disabled={!table.ready}
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button
              disabled={!table.ready || !canSubmit}
              variant="primary"
              size="default"
              className="shrink-0"
              type="submit"
            >
              {t('client360:client_detail.search_form.search_button')}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};
