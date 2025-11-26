import { AIConfigSection } from './AIConfigSection';
import { AutoAssignmentSection } from './AutoAssignmentSection';
import { WorkflowConfigSection } from './WorkflowConfigSection';

export const ConfigurationPanel = () => {
  return (
    <div className="flex flex-col gap-v2-lg">
      <h2 className="text-h2 font-semibold">Configurations générales</h2>
      <AutoAssignmentSection />
      <AIConfigSection />
      <WorkflowConfigSection />
    </div>
  );
};
