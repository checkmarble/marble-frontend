import { AddToCasePanel as SharedAddToCasePanel } from '@app-builder/components/Cases/AddToCasePanel';
import { useAddObjectsToCaseMutation } from '@app-builder/queries/cases/add-objects-to-case';
import { useQueryClient } from '@tanstack/react-query';

interface ClientAddToCasePanelProps {
  objectType: string;
  objectId: string;
}

export function ClientAddToCasePanel({ objectType, objectId }: ClientAddToCasePanelProps) {
  const addObjectsToCaseMutation = useAddObjectsToCaseMutation();
  const queryClient = useQueryClient();
  const objects = [{ objectType, objectId }];

  const refreshClientCases = async () => {
    await queryClient.invalidateQueries({ queryKey: ['data', objectType, objectId, 'cases'] });
  };

  return (
    <SharedAddToCasePanel
      initialMode="new"
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
