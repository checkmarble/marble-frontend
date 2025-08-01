import { knownOutcomes } from '@app-builder/models/outcome';
import { validateOutcomes } from '@app-builder/models/scenario/workflow-validation';
import { type OutcomeDto } from 'marble-api';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { OutcomeBadge } from '../Decisions/OutcomeTag';
import { workflowI18n } from '../Scenario/Workflow/workflow-i18n';

export function SelectOutcomesList({
  selectedOutcomes,
  onSelectedOutcomesChange,
  onValidationChange,
}: {
  selectedOutcomes: OutcomeDto[];
  onSelectedOutcomesChange: (outcomes: OutcomeDto[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const { t } = useTranslation(workflowI18n);
  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);
  const deferredValue = useDeferredValue(searchValue);

  const matches = useMemo(() => matchSorter(knownOutcomes, deferredValue), [deferredValue]);

  // Validate outcomes and notify parent component
  useEffect(() => {
    if (onValidationChange) {
      const isValid = validateOutcomes(selectedOutcomes);
      onValidationChange(isValid);
    }
  }, [selectedOutcomes, onValidationChange]);

  const handleItemSelect = (outcome: OutcomeDto) => {
    const isSelected = selectedOutcomes.includes(outcome);
    if (isSelected) {
      onSelectedOutcomesChange(selectedOutcomes.filter((o) => o !== outcome));
    } else {
      onSelectedOutcomesChange([...selectedOutcomes, outcome]);
    }
  };

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen} persistOnSelect>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="whitespace-nowrap overflow-hidden">
          {(() => {
            const validOutcomes = selectedOutcomes.filter(
              (outcome) => outcome && outcome.length > 0,
            );
            return validOutcomes.length > 0 ? (
              <div className="flex flex-wrap gap-1 overflow-hidden">
                {validOutcomes.map((outcome) => (
                  <OutcomeBadge key={outcome} outcome={outcome} size="md" className="shrink-0" />
                ))}
              </div>
            ) : (
              <span className="text-grey-80 truncate">
                {t('workflows:detail_panel.decision_created.outcomes.placeholder')}
              </span>
            );
          })()}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth={false}>
        <MenuCommand.Combobox placeholder="Search outcomes..." onValueChange={setSearchValue} />
        <MenuCommand.List>
          {matches.map((outcome) => {
            const isSelected = selectedOutcomes.includes(outcome);
            return (
              <MenuCommand.Item
                key={outcome}
                onSelect={() => handleItemSelect(outcome)}
                className="flex items-center gap-2"
              >
                <div className="flex items-center justify-center w-5 h-5">
                  {isSelected && <Icon icon="tick" className="size-4 text-purple-65" />}
                </div>
                <OutcomeBadge outcome={outcome} size="md" className="flex-1 whitespace-nowrap" />
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
