import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type DataModel, isStatusConflictHttpError, type TableModel } from '@app-builder/models';
import {
  type CustomPivotOption,
  getLinksPivotOptions,
  type LinkPivotOption,
  type PivotOption,
} from '@app-builder/services/data/pivot';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import { match } from 'ts-pattern';
import { ModalV2 } from 'ui-design-system';
import { z } from 'zod';

import { SelectField } from './create-pivot/selectField';
import { SelectLinkPath } from './create-pivot/SelectLinkPath';
import { SelectTargetEntity } from './create-pivot/SelectTargetEntity';

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
  | { step: 'field'; pivotOption: null }
  | { step: 'link'; pivotOption: LinkPivotOption };

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

  if (!success) return { success: 'false', errors: error.flatten() };

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

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      setOpen(false);
    }
  }, [fetcher.data?.success, fetcher.state]);

  const [open, setOpenState] = useState(false);

  const setOpen = (isOpening: boolean) => {
    if (!isOpening) {
      setOpenState(false);
      setStepState(initialState);
      return;
    }
    setOpenState(true);
  };

  const [stepState, setStepState] = useState<PivotCreationState>(initialState);

  const onEntitySelected = (value: CustomPivotOption) => {
    console.log('onEntitySelected', value);
    if (value.type === 'sameTable') {
      return setStepState({ step: 'field', pivotOption: null });
    }
    if (value.type === 'link') {
      return setStepState({ step: 'link', pivotOption: value });
    }
    console.error('Unexpected pivot option type:', value);
    return;
  };

  const pivotOptions = useMemo(
    () => getLinksPivotOptions(tableModel, dataModel),
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
    <ModalV2.Root {...{ open, setOpen }}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        {match(stepState)
          .with({ step: 'entity', pivotOption: null }, () => (
            <SelectTargetEntity
              {...{ pivotOptions, tableModel }}
              onSelected={(e) => onEntitySelected(e)}
            />
          ))
          .with({ step: 'link', pivotOption: {} }, ({ pivotOption }) => {
            console.log('pivotOption', pivotOption);
            if (!pivotOption) {
              console.error('No pivot option provided for link step');
              return null;
            }
            return (
              <SelectLinkPath
                {...{ pivotOptions, tableModel }}
                preferedPivotOption={pivotOption}
                onSelected={(e) => createPivot(e)}
              />
            );
          })
          .with({ step: 'field', pivotOption: null }, () => (
            <SelectField {...{ tableModel, onSelected: createPivot }} />
          ))
          .otherwise(() => null)}
      </ModalV2.Content>
    </ModalV2.Root>
  );
}
