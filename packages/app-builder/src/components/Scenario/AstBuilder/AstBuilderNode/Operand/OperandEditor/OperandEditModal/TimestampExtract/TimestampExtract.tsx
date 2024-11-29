import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import {
  type AstNode,
  NewConstantAstNode,
  type TimestampExtractAstNode,
  type TimestampFieldAstNode,
  type ValidTimestampExtractParts,
  validTimestampExtractParts,
} from '@app-builder/models';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import { dateDocHref } from '@app-builder/services/documentation-href';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import {
  type AstNodeErrors,
  computeValidationForNamedChildren,
} from '@app-builder/services/validation/ast-node-validation';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';

import { Operator } from '../../../../Operator';
import { TimestampField } from './TimestampField';

export interface TimestampExtractViewModel {
  timestampField: {
    astNode: TimestampFieldAstNode;
    astNodeErrors?: AstNodeErrors;
  };
  part: ValidTimestampExtractParts;
  errors: {
    timestamp: EvaluationError[];
  };
}

export function adaptTimestampExtractViewModel(
  timestampExtractAstNode: TimestampExtractAstNode,
  astNodeErrors: AstNodeErrors,
): TimestampExtractViewModel {
  return {
    timestampField: {
      astNode: timestampExtractAstNode.namedChildren.timestamp,
      astNodeErrors: astNodeErrors.namedChildren['timestampField'],
    },
    part: timestampExtractAstNode.namedChildren.part.constant,
    errors: {
      timestamp: computeValidationForNamedChildren(
        timestampExtractAstNode,
        astNodeErrors,
        'timestamp',
      ),
    },
  };
}

function adaptTimestampExtractAstNode(
  tsExtractViewModel: TimestampExtractViewModel,
): TimestampExtractAstNode {
  return {
    name: 'TimestampExtract',
    namedChildren: {
      timestamp: tsExtractViewModel.timestampField.astNode,
      part: NewConstantAstNode({ constant: tsExtractViewModel.part }),
    },
    children: [],
  };
}

export function TimestampExtractEdit({
  timestampExtractAstNode,
  astNodeErrors,
  onSave,
}: {
  timestampExtractAstNode: TimestampExtractAstNode;
  astNodeErrors: AstNodeErrors;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation(['scenarios', 'common']);
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();
  const [value, setValue] = React.useState<TimestampExtractViewModel>(() =>
    adaptTimestampExtractViewModel(timestampExtractAstNode, astNodeErrors),
  );

  const handleSave = () => {
    onSave(adaptTimestampExtractAstNode(value));
  };

  return (
    <>
      <ModalV2.Title>
        {t('scenarios:edit_timestamp_extract.title')}
      </ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <Callout variant="outlined">
          <ModalV2.Description className="whitespace-pre text-wrap">
            <Trans
              t={t}
              i18nKey="scenarios:edit_timestamp_extract.description"
              components={{
                DocLink: <ExternalLink href={dateDocHref} />,
              }}
            />
          </ModalV2.Description>
        </Callout>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span>{t('scenarios:edit_timestamp_extract.extract_the')}</span>
            <Operator
              operators={validTimestampExtractParts}
              value={value.part}
              setValue={(part) =>
                setValue({
                  ...value,
                  part,
                })
              }
            />
            <span>{t('scenarios:edit_timestamp_extract.from')}</span>
            <TimestampField
              astNode={value.timestampField.astNode}
              astNodeErrors={value.timestampField.astNodeErrors}
              onChange={(timestampField) =>
                setValue({
                  ...value,
                  timestampField: {
                    astNode: timestampField,
                    astNodeErrors: {
                      errors: [],
                      children: [],
                      namedChildren: {},
                    },
                  },
                  errors: {
                    ...value.errors,
                    timestamp: [],
                  },
                })
              }
              validationStatus={
                value.errors.timestamp.length > 0 ? 'error' : 'valid'
              }
            />
          </div>
          <EvaluationErrors
            errors={adaptEvaluationErrorViewModels([
              ...value.errors.timestamp,
            ]).map(getNodeEvaluationErrorMessage)}
          />
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close
            render={
              <Button className="flex-1" variant="secondary" name="cancel" />
            }
          >
            {t('common:cancel')}
          </ModalV2.Close>
          <Button
            className="flex-1"
            variant="primary"
            name="save"
            onClick={() => handleSave()}
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </>
  );
}
