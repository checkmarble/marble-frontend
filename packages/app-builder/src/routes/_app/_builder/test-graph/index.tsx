import { Page } from '@app-builder/components';
import { useGraphSession } from '@app-builder/components/Graph/contexts/GraphSessionContext';
import { GraphOptionSelect } from '@app-builder/components/Graph/GraphOptionSelect';
import { SessionGraphCanvas } from '@app-builder/components/Graph/SessionGraphCanvas';
import { useDataModel } from '@app-builder/services/data/data-model';
import { createFileRoute } from '@tanstack/react-router';
import { Button, Card, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const Route = createFileRoute('/_app/_builder/test-graph/')({
  component: TestGraphRoute,
});

function StartRecordPicker({
  tableNames,
  recordType,
  recordId,
  onRecordTypeChange,
  onRecordIdChange,
  onLoad,
  isLoading,
}: {
  tableNames: string[];
  recordType: string;
  recordId: string;
  onRecordTypeChange: (value: string) => void;
  onRecordIdChange: (value: string) => void;
  onLoad: () => void;
  isLoading: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onLoad();
      }}
      className="flex flex-col gap-sm"
    >
      <div className="flex flex-wrap items-end gap-md">
        <div className="flex flex-col gap-xs">
          <span className="text-grey-secondary text-xs">Table</span>
          <GraphOptionSelect
            className="min-w-40"
            size="small"
            value={recordType}
            placeholder="Select table"
            options={tableNames.map((name) => ({ value: name, label: name }))}
            onChange={onRecordTypeChange}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor="graph-record-id" className="text-grey-secondary text-xs">
            Object id
          </label>
          <Input
            id="graph-record-id"
            size="small"
            value={recordId}
            onChange={(event) => onRecordIdChange(event.target.value)}
            placeholder="object id"
            className="min-w-56"
          />
        </div>
        <Button variant="primary" disabled={!recordType || !recordId.trim() || isLoading} type="submit">
          {isLoading ? (
            <>
              <Icon icon="restart-alt" className="size-4 animate-spin" />
              Loading
            </>
          ) : (
            <>
              <Icon icon="search" className="size-4" />
              Load
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function TestGraphRoute() {
  const dataModel = useDataModel();
  const { recordType, setRecordType, recordId, setRecordId, isGeneratingGraph, loadGraph } = useGraphSession();

  const tableNames = dataModel.map((table) => table.name).sort((a, b) => a.localeCompare(b));

  return (
    <Page.Content className="min-h-0 flex-1" width="fluid">
      <div className="flex min-h-0 flex-1 flex-col gap-md">
        <StartRecordPicker
          tableNames={tableNames}
          recordType={recordType}
          recordId={recordId}
          onRecordTypeChange={setRecordType}
          onRecordIdChange={setRecordId}
          onLoad={loadGraph}
          isLoading={isGeneratingGraph}
        />
        <SessionGraphCanvas
          placeholder={
            <Card className="text-grey-secondary flex min-h-0 flex-1 items-center justify-center p-lg text-sm">
              Select a table and object id, then load the graph.
            </Card>
          }
        />
      </div>
    </Page.Content>
  );
}
