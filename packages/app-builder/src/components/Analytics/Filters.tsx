import { type Scenario } from '@app-builder/models/scenario';
import { useEffect, useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';

export function Filters({
  selectedScenarioId: initialSelectedScenarioId,
  scenarios,
}: {
  selectedScenarioId: string | null;
  scenarios: Scenario[];
}) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    initialSelectedScenarioId,
  );

  useEffect(() => {
    setSelectedScenarioId(initialSelectedScenarioId);
  }, [initialSelectedScenarioId]);

  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId);

  return (
    <div className="flex flex-col gap-2 p-2">
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="primary" size="medium">
            <MenuCommand.Arrow />
            <span className="text-xs">{selectedScenario?.name}</span>
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content>
          <MenuCommand.Combobox autoFocus onValueChange={setSelectedScenarioId} />
          <MenuCommand.List className="p-1">
            {scenarios.map((scenario) => (
              <MenuCommand.Item key={scenario.id} value={scenario.id}>
                <span className="text-xs">{scenario.name}</span>
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
}
