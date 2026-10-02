import { AddToCasePanel as SharedAddToCasePanel } from '@app-builder/components/Cases/AddToCasePanel';
import { RiskLevelBadge } from '@app-builder/components/UserScoring/RiskLevelBadge';
import { isMaxRiskLevelInRange, type MaxRiskLevel } from '@app-builder/models/scoring';
import { useAddObjectsToCaseMutation } from '@app-builder/queries/cases/add-objects-to-case';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useGetScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import { useDataModel } from '@app-builder/services/data/data-model';
import { fromSUUIDtoUUID } from '@app-builder/utils/short-uuid';
import { useQueryClient } from '@tanstack/react-query';
import { useMatch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';
import { getObjectName } from '../CaseManager/PivotTabs';
import { subEntityIcon } from '../Graph/GraphComponents';
import { createGraphTypeHelpers } from '../Graph/lib/data-model-map';
import { Spinner } from '../Spinner';

export interface CaseObjectRef {
  objectType: string;
  objectId: string;
  label?: string;
  riskLevel?: number;
}

interface ClientAddToCasePanelProps {
  objects: CaseObjectRef[];
}

export function ClientAddToCasePanel({ objects }: ClientAddToCasePanelProps) {
  const caseRouteMatch = useMatch({ from: '/_app/_builder/cases/_detail/s/$caseId', shouldThrow: false });
  const caseId = caseRouteMatch ? fromSUUIDtoUUID(caseRouteMatch.params.caseId) : undefined;
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
      caseId={caseId}
    />
  );
}

function CaseObjectsList({ objects }: { objects: CaseObjectRef[] }) {
  const { t } = useTranslation('cases');
  const hasRiskLevel = objects.some((object) => object.riskLevel != null);
  const settingsQuery = useGetScoringSettingsQuery(hasRiskLevel);
  const rawMaxRiskLevel = settingsQuery.data?.settings?.maxRiskLevel;
  const maxRiskLevel = rawMaxRiskLevel != null && isMaxRiskLevelInRange(rawMaxRiskLevel) ? rawMaxRiskLevel : undefined;

  if (objects.length === 0) return null;

  return (
    <div className="flex flex-col gap-sm">
      <p className="text-s text-grey-primary font-semibold first-letter:capitalize">{t('cases:add_to_case.clients')}</p>
      <ul className="flex flex-col gap-xs">
        {objects.map((object) => (
          <CaseObjectRow key={`${object.objectType}:${object.objectId}`} object={object} maxRiskLevel={maxRiskLevel} />
        ))}
      </ul>
    </div>
  );
}

function CaseObjectRow({ object, maxRiskLevel }: { object: CaseObjectRef; maxRiskLevel?: MaxRiskLevel }) {
  const dataModel = useDataModel();
  const typeHelpers = createGraphTypeHelpers(dataModel);
  const detailsQuery = useObjectDetailsQuery(object.objectType, object.objectId, !object?.label);

  return (
    <li className="flex min-w-0 items-center gap-sm">
      <Icon
        icon={subEntityIcon({
          semanticType: typeHelpers.getSemanticType(object.objectType),
          subEntity: typeHelpers.getPersonSubEntity(object.objectType),
        })}
        className="size-4 shrink-0 text-purple-primary"
      />
      {object.label ? (
        <span className="truncate text-sm">{object.label}</span>
      ) : detailsQuery.isPending ? (
        <Spinner className="size-4" />
      ) : (
        <span className="truncate text-sm">
          {getObjectName(dataModel, object.objectType, detailsQuery.data?.data ?? {}, object.objectId)}
        </span>
      )}
      {object.riskLevel != null && maxRiskLevel != null ? (
        <RiskLevelBadge riskLevel={object.riskLevel} maxRiskLevel={maxRiskLevel} />
      ) : null}
    </li>
  );
}
