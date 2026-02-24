import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useApplyArchetypeMutation } from '@app-builder/queries/data/apply-archetype';
import { type Archetype, useListArchetypesQuery } from '@app-builder/queries/data/list-archetypes';
import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function SelectArchetype({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(['data', 'common']);
  const { data: archetypes, isLoading } = useListArchetypesQuery();
  const applyArchetypeMutation = useApplyArchetypeMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const revalidate = useLoaderRevalidator();

  const handleApply = () => {
    if (!selectedArchetype) return;

    applyArchetypeMutation.mutateAsync({ name: selectedArchetype.name }).then((result) => {
      revalidate();

      if (result.success) {
        setIsOpen(false);
        setSelectedArchetype(null);
      }
    });
  };

  return (
    <Modal.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSelectedArchetype(null);
        }
      }}
    >
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('data:select_archetype.title')}</Modal.Title>
        <div className="flex flex-col gap-4 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Icon icon="spinner" className="size-8 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {archetypes?.map((archetype) => (
                <ArchetypeCard
                  key={archetype.name}
                  archetype={archetype}
                  isSelected={selectedArchetype?.name === archetype.name}
                  onSelect={() => setSelectedArchetype(archetype)}
                />
              ))}
            </div>
          )}
        </div>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" appearance="stroked">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            className="flex-1"
            variant="primary"
            disabled={!selectedArchetype || applyArchetypeMutation.isPending}
            onClick={handleApply}
          >
            {applyArchetypeMutation.isPending ? <Icon icon="spinner" className="size-5 animate-spin" /> : null}
            {t('data:select_archetype.button_accept')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

function ArchetypeCard({
  archetype,
  isSelected,
  onSelect,
}: {
  archetype: Archetype;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'flex flex-col gap-1 rounded-lg border-2 p-4 text-left transition-colors',
        isSelected ? 'border-purple-primary bg-purple-background' : 'border-grey-border hover:border-grey-placeholder',
      )}
    >
      <span className="text-s font-semibold text-grey-primary">{archetype.label ?? archetype.name}</span>
      {archetype.description ? <span className="text-s text-grey-secondary">{archetype.description}</span> : null}
    </button>
  );
}
