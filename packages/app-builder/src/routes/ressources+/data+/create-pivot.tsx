import { Callout } from '@app-builder/components';
import { PivotType } from '@app-builder/components/Data/PivotDetails';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Highlight } from '@app-builder/components/Highlight';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type DataModel, isStatusConflictHttpError, type TableModel } from '@app-builder/models';
import { getPivotOptions, type PivotOption } from '@app-builder/services/data/pivot';
import { pivotValuesDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Input, ModalV2, SelectWithCombobox } from 'ui-design-system';
import { z } from 'zod';

const createPivotFormSchema = z.object({
  pivot: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('field'),
      fieldId: z.string(),
      baseTableId: z.string(),
      id: z.string(),
      displayValue: z.string(),
    }),
    z.object({
      type: z.literal('link'),
      pathLinkIds: z.array(z.string()),
      baseTableId: z.string(),
      id: z.string(),
      displayValue: z.string(),
    }),
  ]),
});

type CreatePivotForm = z.infer<typeof createPivotFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const [session, t, raw, { dataModelRepository }] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common', 'data']),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = createPivotFormSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: error.flatten() });

  try {
    await dataModelRepository.createPivot(data.pivot);

    return json({ success: 'true', errors: [] });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message: isStatusConflictHttpError(error)
        ? t('data:create_pivot.errors.data.duplicate_pivot_value')
        : t('common:errors.unknown'),
    });

    return json(
      { success: 'false', errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export function CreatePivot({
  tableModel,
  dataModel,
  children,
}: {
  tableModel: TableModel;
  dataModel: DataModel;
  children: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <CreatePivotContent
          tableModel={tableModel}
          dataModel={dataModel}
          closeModal={() => {
            setOpen(false);
          }}
        />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function CreatePivotContent({
  tableModel,
  dataModel,
  closeModal,
}: {
  tableModel: TableModel;
  dataModel: DataModel;
  closeModal: () => void;
}) {
  const { t } = useTranslation(['common', 'data']);
  const fetcher = useFetcher<typeof action>();

  const pivotOptions = useMemo(
    () => getPivotOptions(tableModel, dataModel),
    [dataModel, tableModel],
  );

  const form = useForm<CreatePivotForm>({
    defaultValues: {
      pivot: pivotOptions[0] as PivotOption,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/data/create-pivot'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChangeAsync: createPivotFormSchema,
      onBlurAsync: createPivotFormSchema,
      onSubmitAsync: createPivotFormSchema,
    },
  });

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      closeModal();
    }
  }, [closeModal, fetcher.data?.success, fetcher.state]);

  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () =>
      matchSorter(pivotOptions, deferredSearchValue, {
        keys: ['displayValue'],
      }),
    [pivotOptions, deferredSearchValue],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <ModalV2.Title>{t('data:create_pivot.title')}</ModalV2.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <Callout variant="outlined">
          <ModalV2.Description className="whitespace-pre text-wrap">
            <Trans
              t={t}
              i18nKey="data:create_pivot.description"
              components={{
                DocLink: <ExternalLink href={pivotValuesDocHref} />,
              }}
            />
          </ModalV2.Description>
        </Callout>
        <form.Field name="pivot">
          {(field) => (
            <div className="flex flex-col gap-2">
              <FormLabel name={field.name}>{t('data:create_pivot.select.label')}</FormLabel>
              <SelectWithCombobox.Root
                searchValue={searchValue}
                onSearchValueChange={setSearchValue}
                selectedValue={field.state.value.id}
                onSelectedValueChange={(value): void => {
                  field.handleChange(
                    pivotOptions.find((pivot) => pivot.id === value) as PivotOption,
                  );
                }}
              >
                <SelectWithCombobox.Select className="w-full">
                  {field.state.value?.displayValue}
                  <SelectWithCombobox.Arrow />
                </SelectWithCombobox.Select>
                <SelectWithCombobox.Popover
                  className="z-50 flex flex-col gap-2 p-2"
                  portal
                  sameWidth
                >
                  <SelectWithCombobox.Combobox
                    render={<Input className="shrink-0" />}
                    autoSelect
                    autoFocus
                  />
                  <SelectWithCombobox.ComboboxList>
                    {matches.map((pivot) => (
                      <SelectWithCombobox.ComboboxItem
                        key={pivot.id}
                        value={pivot.id}
                        className="flex items-center justify-between"
                      >
                        <Highlight text={pivot.displayValue} query={deferredSearchValue} />
                        <PivotType type={pivot.type} />
                      </SelectWithCombobox.ComboboxItem>
                    ))}
                    {matches.length === 0 ? (
                      <p className="text-grey-50 flex items-center justify-center p-2">
                        {t('data:create_pivot.select.empty_matches')}
                      </p>
                    ) : null}
                  </SelectWithCombobox.ComboboxList>
                </SelectWithCombobox.Popover>
              </SelectWithCombobox.Root>
              <FormErrorOrDescription errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
            {t('common:cancel')}
          </ModalV2.Close>
          <Button className="flex-1" variant="primary" type="submit">
            {t('data:create_pivot.button_accept')}
          </Button>
        </div>
      </div>
    </form>
  );
}
