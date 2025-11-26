import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const AIConfigSection = () => {
  return (
    <div className="flex flex-col gap-v2-sm">
      {/* Section header */}
      <div className="flex items-center gap-v2-sm h-7">
        <span className="flex-1 text-s font-medium">Configurations IA</span>
        <Tag color="purple" size="small" border="rounded-sm">
          5/10 crédit IA utilisés
        </Tag>
      </div>

      {/* Général panel */}
      <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center gap-v2-xs">
            <span className="text-s font-medium">Général</span>
            <Tag color="green" size="small" border="rounded-sm">
              Configuré
            </Tag>
          </div>
          <button type="button" className="size-6 flex items-center justify-center text-purple-65" disabled>
            <Icon icon="edit" className="size-4" />
          </button>
        </div>
      </div>

      {/* AI case review KYC enrichment panel */}
      <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center gap-v2-xs">
            <span className="text-s font-medium">AI case review KYC enrichment</span>
            <Tag color="green" size="small" border="rounded-sm">
              Actif
            </Tag>
            <Tag color="orange" size="small" border="rounded-sm">
              A configurer
            </Tag>
          </div>
          <button type="button" className="size-6 flex items-center justify-center text-purple-65" disabled>
            <Icon icon="arrow-right" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
