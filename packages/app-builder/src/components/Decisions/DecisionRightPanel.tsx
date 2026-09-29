import { AddToCasePanel } from '@app-builder/components/Cases/AddToCasePanel';
import { useAddToCaseMutation } from '@app-builder/queries/cases/add-to-case';

interface DecisionRightPanelProps {
  decisionIds: string[];
}

export function DecisionRightPanel({ decisionIds }: DecisionRightPanelProps) {
  const addToCaseMutation = useAddToCaseMutation();

  return (
    <AddToCasePanel
      onCreateCase={({ name, inboxId }) => addToCaseMutation.mutateAsync({ newCase: true, name, inboxId, decisionIds })}
      onAddToCase={({ caseId }) => addToCaseMutation.mutateAsync({ newCase: false, caseId, decisionIds })}
    />
  );
}
