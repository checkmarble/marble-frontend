import { CaseManagerDrawerButtons } from '@app-builder/components/CaseManager/Drawer/Drawer';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

type DecisionPanelProps = {
  decisionId: string;
  selectDecision: (id: string | null) => void;
};

export function DecisionPanel({ selectDecision }: DecisionPanelProps) {
  return (
    <div className="flex flex-col pl-4">
      <div className="sticky top-0 z-10 flex items-center">
        <Button variant="secondary" size="small" onClick={() => selectDecision(null)}>
          <Icon icon="left-panel-close" className="size-4" />
        </Button>
        <CaseManagerDrawerButtons expandable={true} />
      </div>

      <div>TATATATATATATATATATATAT</div>
    </div>
  );
}
