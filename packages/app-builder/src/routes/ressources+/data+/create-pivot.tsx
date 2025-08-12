import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type DataModel, isStatusConflictHttpError, type TableModel } from '@app-builder/models';
import {
  type CustomPivotOption,
  type FieldPivotOption,
  getFieldPivotOptions,
  getLinksPivotOptions,
  type LinkPivotOption,
  type PivotOption,
} from '@app-builder/services/data/pivot';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Code, Modal } from 'ui-design-system';
import { z } from 'zod/v4';
import { SelectLinkPath } from './create-pivot/SelectLinkPath';
import { SelectTargetEntity } from './create-pivot/SelectTargetEntity';
import { SelectField } from './create-pivot/selectField';
import { ValidateSelfPivot } from './create-pivot/ValidateSelfPivot';

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

// type CreatePivotForm = z.infer<typeof createPivotFormSchema>;

type PivotCreationState =
  | { step: 'entity'; pivotOption: null }
  | { step: 'self'; pivotOption: FieldPivotOption }
  | { step: 'field'; pivotOption: null }
  | { step: 'link'; pivotOption: PivotOption };

const initialState: PivotCreationState = {
  step: 'entity',
  pivotOption: null,
};

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, t, raw, { dataModelRepository }] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common', 'data']),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = createPivotFormSchema.safeParse(raw);

  if (!success) return { success: 'false', errors: z.treeifyError(error) };

  try {
    await dataModelRepository.createPivot(data.pivot);

    return { success: 'true', errors: [] };
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
  const fetcher = useFetcher<typeof action>();
  const { t } = useTranslation(['common', 'data']);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      onOpenChange(false);
    }
  }, [fetcher.data?.success, fetcher.state]);

  const [open, setOpenState] = useState(false);

  const onOpenChange = (isOpening: boolean) => {
    if (!isOpening) {
      setOpenState(false);
      setStepState(initialState);
      return;
    }
    setOpenState(true);
  };

  const [stepState, setStepState] = useState<PivotCreationState>(initialState);

  const onEntitySelected = (value: CustomPivotOption) => {
    switch (value.type) {
      case 'field':
        return setStepState({ step: 'self', pivotOption: value });
      case 'link':
        return setStepState({ step: 'link', pivotOption: value });
      case 'sameTable':
        return setStepState({ step: 'field', pivotOption: null });
      default:
        console.error('Unexpected pivot option type:', value);
        return;
    }
  };
  const onBack = () => setStepState(initialState);

  const [pivotOptions, fieldOptions] = useMemo(
    () => [getLinksPivotOptions(tableModel, dataModel), getFieldPivotOptions(tableModel)],
    [dataModel, tableModel],
  );

  const createPivot = (pivot: PivotOption) => {
    fetcher.submit(JSON.stringify({ pivot }), {
      method: 'POST',
      action: getRoute('/ressources/data/create-pivot'),
      encType: 'application/json',
    });
  };
  return (
    <Modal.Root {...{ open, onOpenChange }}>
      <Modal.Trigger>{children}</Modal.Trigger>
      <Modal.Content>
        <Modal.Title>
          <Trans
            className="inline-block"
            t={t}
            i18nKey="data:create_pivot.title"
            components={{
              Code: <Code />,
            }}
            values={{ table: tableModel.name }}
          />
        </Modal.Title>

        {match(stepState)
          .with({ step: 'entity', pivotOption: null }, () => (
            <SelectTargetEntity
              {...{ pivotOptions, tableModel }}
              hasFieldOptions={fieldOptions.length > 0}
              onSelected={onEntitySelected}
            />
          ))
          .with({ step: 'link', pivotOption: {} }, ({ pivotOption }) => {
            if (!pivotOption) {
              console.error('No pivot option provided for link step');
              return null;
            }
            return (
              <SelectLinkPath
                {...{ pivotOptions, tableModel, onBack }}
                preferedPivotOption={pivotOption as LinkPivotOption}
                onSelected={(e) => createPivot(e)}
              />
            );
          })
          .with({ step: 'self', pivotOption: {} }, ({ pivotOption }) => (
            <ValidateSelfPivot {...{ pivotOption, tableModel, onBack }} onValidate={createPivot} />
          ))
          .with({ step: 'field', pivotOption: null }, () => (
            <SelectField
              {...{ tableModel, onSelected: createPivot, onBack }}
              pivotOptions={fieldOptions}
            />
          ))
          .otherwise(() => null)}
      </Modal.Content>
    </Modal.Root>
  );
}
