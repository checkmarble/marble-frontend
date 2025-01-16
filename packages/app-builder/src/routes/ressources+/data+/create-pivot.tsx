import { Callout } from '@app-builder/components';
import { PivotType } from '@app-builder/components/Data/PivotDetails';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { Highlight } from '@app-builder/components/Highlight';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  type DataModel,
  isStatusConflictHttpError,
  type TableModel,
} from '@app-builder/models';
import { getPivotOptions } from '@app-builder/services/data/pivot';
import { pivotValuesDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
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

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedData = createPivotFormSchema.safeParse(await request.json());

  if (!parsedData.success) {
    parsedData.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: null,
      error: parsedData.error.format(),
    });
  }

  const { pivot } = parsedData.data;

  try {
    await dataModelRepository.createPivot(pivot);

    return json({
      success: true as const,
      values: null,
      error: null,
    });
  } catch (error) {
    const {
      i18nextService: { getFixedT },
      toastSessionService: { getSession, commitSession },
    } = serverServices;
    const t = await getFixedT(request, ['common', 'data']);
    let message = t('common:errors.unknown');
    if (isStatusConflictHttpError(error)) {
      message = t('data:create_pivot.errors.data.duplicate_pivot_value');
    }
    const toastSession = await getSession(request);
    setToastMessage(toastSession, {
      type: 'error',
      message,
    });
    return json(
      {
        success: false as const,
        values: parsedData.data,
        error,
      },
      {
        headers: {
          'Set-Cookie': await commitSession(toastSession),
        },
      },
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

  const pivotOptions = React.useMemo(
    () => getPivotOptions(tableModel, dataModel),
    [dataModel, tableModel],
  );

  const formMethods = useForm<z.infer<typeof createPivotFormSchema>>({
    progressive: true,
    resolver: zodResolver(createPivotFormSchema),
    defaultValues: {
      pivot: pivotOptions[0],
    },
  });
  const { control } = formMethods;

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      closeModal();
    }
  }, [closeModal, fetcher.data?.success, fetcher.state]);

  const [searchValue, setSearchValue] = React.useState('');
  const deferredSearchValue = React.useDeferredValue(searchValue);

  const matches = React.useMemo(
    () =>
      matchSorter(pivotOptions, deferredSearchValue, {
        keys: ['displayValue'],
      }),
    [pivotOptions, deferredSearchValue],
  );

  return (
    <Form
      control={control}
      onSubmit={({ formDataJson }): void => {
        fetcher.submit(formDataJson, {
          method: 'POST',
          action: getRoute('/ressources/data/create-pivot'),
          encType: 'application/json',
        });
      }}
    >
      <FormProvider {...formMethods}>
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
          <FormField
            name="pivot"
            control={control}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>{t('data:create_pivot.select.label')}</FormLabel>
                <FormControl>
                  <SelectWithCombobox.Root
                    searchValue={searchValue}
                    onSearchValueChange={setSearchValue}
                    selectedValue={field.value.id}
                    onSelectedValueChange={(value): void => {
                      const pivot = pivotOptions.find(
                        (pivot) => pivot.id === value,
                      );
                      field.onChange(pivot);
                    }}
                  >
                    <SelectWithCombobox.Select className="w-full">
                      {field.value?.displayValue}
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
                            <Highlight
                              text={pivot.displayValue}
                              query={deferredSearchValue}
                            />
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
                </FormControl>
                <FormError />
              </FormItem>
            )}
          />
          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close
              render={<Button className="flex-1" variant="secondary" />}
            >
              {t('common:cancel')}
            </ModalV2.Close>
            <Button className="flex-1" variant="primary" type="submit">
              {t('data:create_pivot.button_accept')}
            </Button>
          </div>
        </div>
      </FormProvider>
    </Form>
  );
}
