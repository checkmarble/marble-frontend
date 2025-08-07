import { Callout } from '@app-builder/components/Callout';
import { type Rule } from '@app-builder/models/scenario/workflow';
import { type DraggableProvided, type DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ActionSelector } from './ActionSelector';
import { ConditionSelector } from './ConditionSelector';
import { useRule } from './RuleProvider';
import { useWorkflow } from './WorkflowProvider';

interface RuleProps {
  rule: Rule;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

export function WorkflowRule({ rule, provided, snapshot }: RuleProps) {
  const { t } = useTranslation(['common', 'workflows']);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingRuleName, setEditingRuleName] = useState<string>('');

  console.log('rule', rule);
  const {
    rule: currentRule,
    isModified,
    updateRuleName,
    addCondition,
    updateCondition,
    updateAction,
    deleteCondition,
    saveRule,
    cancelChanges,
    hasValidationErrors,
  } = useRule();

  const { deleteRule, dataModel, triggerObjectType } = useWorkflow();

  const isRuleModified = isModified;
  const hasValidationErrorsForRule = hasValidationErrors();

  // Use the current rule from context, fallback to prop if not available
  const displayRule = currentRule || rule;

  const handleRenameClick = (event: React.MouseEvent, ruleId: string, currentName: string) => {
    event.stopPropagation();
    setEditingRuleId(ruleId);
    setEditingRuleName(currentName);
  };

  const handleNameChange = (newName: string) => {
    if (newName.trim() !== displayRule.name) {
      updateRuleName(newName.trim());
    }
  };

  const handleCancelRenaming = () => {
    setEditingRuleId(null);
    setEditingRuleName('');
  };

  const handleRenameKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCancelRenaming();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancelRenaming();
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-4 w-full">
      {/* Rule Container */}
      <div
        className={`w-full max-w-7xl mx-auto relative transition-all duration-200 ${
          snapshot.isDragging ? 'rotate-1 scale-105 z-50' : ''
        } ${isRuleModified ? 'drop-shadow-2xl' : ''}`}
      >
        {/* Conditions and Actions Boxes */}
        <div className="flex items-center w-full">
          <div className="flex-none items-stretch relative w-[750px] bg-grey-100">
            {/* Rule title bar */}
            <div
              className={` text-grey-00 font-semibold px-4 py-2 rounded-t-lg border-2 border-b-0 w-auto bg-purple-98 flex items-center justify-between ${
                snapshot.isDragging
                  ? 'border-purple-60'
                  : isRuleModified
                    ? 'border-purple-60 shadow-lg ring-2 ring-blue-200'
                    : 'border-grey-90'
              }`}
              style={{ marginBottom: 0 }}
            >
              {editingRuleId === displayRule.id ? (
                <input
                  type="text"
                  value={editingRuleName}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditingRuleName(newValue);
                    // Trigger modification state on first keystroke
                    if (newValue.trim() !== displayRule.name) {
                      handleNameChange(newValue.trim());
                    }
                  }}
                  onBlur={(e) => {
                    // Only cancel editing if not clicking on buttons or other interactive elements
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (!relatedTarget || !relatedTarget.closest('button')) {
                      handleCancelRenaming();
                    }
                  }}
                  onKeyDown={(e) => handleRenameKeyDown(e)}
                  autoFocus
                  className="bg-white font-semibold text-base w-2/3 min-w-0 px-2 py-1 rounded border-2 border-purple-60 outline-none focus:ring-2 focus:ring-purple-30 transition-all"
                  style={{
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    lineHeight: 'inherit',
                  }}
                />
              ) : (
                <span
                  className="cursor-text hover:bg-white hover:bg-opacity-20 px-1 py-0.5 rounded transition-colors"
                  onClick={(event) => handleRenameClick(event, displayRule.id, displayRule.name)}
                >
                  {displayRule.name}
                </span>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={(event) => handleRenameClick(event, displayRule.id, displayRule.name)}
                  disabled={editingRuleId === displayRule.id}
                >
                  <Icon icon="edit" className="size-5" />
                  {t('common:rename')}
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => deleteRule(displayRule.id, displayRule.name)}
                  className="flex items-center hover:bg-red-200 text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <Icon icon="delete" className="size-5" />
                  {t('common:delete')}
                </Button>
              </div>
            </div>
            <div
              className={`rounded-b-lg border-2 border-t-0 border-grey-90 bg-white p-4 transition-all duration-200 relative ${
                snapshot.isDragging
                  ? 'border-purple-60 shadow-xl'
                  : isRuleModified
                    ? 'border-purple-60 shadow-xl'
                    : 'border-grey-20'
              }`}
            >
              {/* Drag Handle */}
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-12 rounded-full cursor-grab active:cursor-grabbing transition-all duration-200 flex items-center justify-center ${
                  snapshot.isDragging ? 'bg-purple-60 shadow-lg' : 'bg-grey-30 hover:bg-grey-40'
                }`}
                {...provided.dragHandleProps}
              >
                <Icon icon="drag" className="size-3 text-white" />
              </div>
              <div className="bg-grey-05 rounded-md p-1 overflow-x-auto w-full">
                {displayRule.conditions?.length > 0 ? (
                  <div className="flex flex-col gap-2 relative whitespace-nowrap">
                    {displayRule.conditions.map((condition, conditionIndex: number) => {
                      return (
                        <div
                          key={condition.id || conditionIndex}
                          className="group flex items-center relative transition-all duration-200"
                        >
                          {/* Vertical line connecting conditions */}
                          {conditionIndex > 0 && (
                            <div className="absolute left-8 top-0 w-0.5 h-8 bg-grey-30 -translate-y-4"></div>
                          )}
                          <div className="flex items-center gap-2 flex-1">
                            <div>
                              <ConditionSelector
                                condition={condition}
                                isFirst={conditionIndex === 0}
                                triggerObjectType={triggerObjectType}
                                dataModel={dataModel}
                                onChange={(updatedCondition) => {
                                  updateCondition(condition.id, updatedCondition);
                                }}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              type="button"
                              onClick={() => deleteCondition(condition.id)}
                              className="opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 hover:bg-red-200 text-red-600 hover:text-red-700"
                            >
                              <Icon icon="delete" className="size-5 shrink-0" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Callout variant="outlined">
                    {t('workflows:rule.no_conditions.description')}
                  </Callout>
                )}
                <div className="mt-5 flex items-center justify-between">
                  <ConditionSelector
                    triggerObjectType={triggerObjectType}
                    dataModel={dataModel}
                    onChange={(newCondition) => addCondition(newCondition)}
                  />
                  {/* <div className="flex flex-col items-center gap-2">
                    {ruleValidationErrors.length > 0 && (
                      <div className="text-red-47 text-sm">
                        {ruleValidationErrors.map((error) => (
                          <div key={error}>{error}</div>
                        ))}
                      </div>
                    )}
                  </div> */}
                  {isRuleModified && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => cancelChanges()}>
                          <Icon icon="arrow-left" className="size-4" />
                          {t('common:cancel')}
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => saveRule()}
                          disabled={hasValidationErrorsForRule}
                        >
                          <Icon icon="checked" className="size-4" />
                          {t('common:validate')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* "Then" arrow */}
          <div className="flex items-center justify-center">
            <div className="w-24 h-0.5 bg-grey-90 relative">
              <div className="absolute -right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-grey-50"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-grey-90 px-3 py-1 rounded z-10">
                <span className="text-sm font-bold text-white uppercase tracking-wide">
                  {t('common:then')}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Box */}
          <div
            className={`flex-none rounded-lg border-2 border-grey-90 bg-white p-4 transition-all duration-200 w-[400px] bg-grey-100 ${
              snapshot.isDragging
                ? 'border-purple-60 shadow-xl'
                : isRuleModified
                  ? 'border-purple-60 shadow-xl ring-2 ring-blue-200'
                  : 'border-grey-20'
            }`}
          >
            <div className="bg-grey-05 rounded-md">
              <ActionSelector
                action={displayRule.actions?.[0]}
                onChange={(action) => updateAction(action)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
