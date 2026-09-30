import { AddToCasePanel as SharedAddToCasePanel } from '@app-builder/components/Cases/AddToCasePanel';
import { type DataModelObjectValue } from '@app-builder/models';
import { useAddObjectsToCaseMutation } from '@app-builder/queries/cases/add-objects-to-case';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useDataModel } from '@app-builder/services/data/data-model';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';
import { subEntityIcon } from '../Graph/GraphComponents';
import { createGraphTypeHelpers } from '../Graph/lib/data-model-map';
import { resolveTitle } from '../Graph/lib/resolve-object-title';
import { Spinner } from '../Spinner';

export interface CaseObjectRef {
  objectType: string;
  objectId: string;
}

interface ClientAddToCasePanelProps {
  objects: CaseObjectRef[];
}

export function ClientAddToCasePanel({ objects }: ClientAddToCasePanelProps) {
  const addObjectsToCaseMutation = useAddObjectsToCaseMutation();
  const queryClient = useQueryClient();

  const refreshClientCases = async () => {
    await Promise.all(
      objects.map((object) =>
        queryClient.invalidateQueries({ queryKey: ['data', object.objectType, object.objectId, 'cases'] }),
      ),
    );
  };

  return (
    <SharedAddToCasePanel
      initialMode="new"
      leadingContent={<CaseObjectsList objects={objects} />}
      onCreateCase={async ({ name, inboxId }) => {
        const caseDetail = await addObjectsToCaseMutation.mutateAsync({ newCase: true, name, inboxId, objects });
        await refreshClientCases();
        return caseDetail;
      }}
      onAddToCase={async ({ caseId }) => {
        const caseDetail = await addObjectsToCaseMutation.mutateAsync({ newCase: false, caseId, objects });
        await refreshClientCases();
        return caseDetail;
      }}
    />
  );
}

function CaseObjectsList({ objects }: { objects: CaseObjectRef[] }) {
  const { t } = useTranslation('cases');

  if (objects.length === 0) return null;

  return (
    <div className="flex flex-col gap-sm">
      <p className="text-s text-grey-primary font-semibold first-letter:capitalize">{t('cases:add_to_case.clients')}</p>
      <ul className="flex flex-col gap-xs">
        {objects.map((object) => (
          <CaseObjectRow key={`${object.objectType}:${object.objectId}`} object={object} />
        ))}
      </ul>
    </div>
  );
}

function CaseObjectRow({ object }: { object: CaseObjectRef }) {
  const dataModel = useDataModel();
  const typeHelpers = createGraphTypeHelpers(dataModel);
  const table = dataModel.find((item) => item.name === object.objectType);
  const detailsQuery = useObjectDetailsQuery(object.objectType, object.objectId);
  const name = resolveTitle(readCaption(table?.captionField, detailsQuery.data?.data), object.objectId);

  return (
    <li className="flex min-w-0 items-center gap-sm">
      <Icon
        icon={subEntityIcon({
          semanticType: typeHelpers.getSemanticType(object.objectType),
          subEntity: typeHelpers.getPersonSubEntity(object.objectType),
        })}
        className="size-4 shrink-0 text-purple-primary"
      />
      {detailsQuery.isPending ? <Spinner className="size-4" /> : <span className="truncate text-sm">{name}</span>}
    </li>
  );
}

function readCaption(
  captionField: string | undefined,
  data: Record<string, DataModelObjectValue> | undefined,
): string | undefined {
  if (!captionField || !data) return undefined;
  const value = data[captionField];
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return undefined;
}
