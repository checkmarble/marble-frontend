import { type Scenario } from '@app-builder/models/scenario';
import { Button, MenuCommand } from 'ui-design-system';

export function Filters({
  selectedScenarioId,
  scenarios,
  onSelectedScenarioIdChange,
}: {
  selectedScenarioId: string;
  scenarios: Scenario[];
  onSelectedScenarioIdChange: (scenarioId: string) => void;
}) {
  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId);
  console.log('selectedScenarioId', selectedScenarioId);

  return (
    <div className="flex flex-col gap-2 p-2">
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="primary" size="medium">
            <MenuCommand.Arrow />
            <span className="text-xs">{selectedScenario?.name}</span>
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth sideOffset={4} align="start" className="min-w-24">
          <MenuCommand.Combobox autoFocus />
          <MenuCommand.List className="p-1">
            {scenarios.map((scenario) => (
              <MenuCommand.Item
                key={scenario.id}
                value={scenario.id}
                onSelect={() => onSelectedScenarioIdChange(scenario.id)}
              >
                <span className="text-xs">{scenario.name}</span>
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
}
