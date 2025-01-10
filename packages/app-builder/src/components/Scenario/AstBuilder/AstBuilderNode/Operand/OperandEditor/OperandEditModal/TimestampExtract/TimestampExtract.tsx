import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { type AstNode, type CurrentUser, isAdmin } from '@app-builder/models';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import {
  type TimestampExtractAstNode,
  type TimestampFieldAstNode,
  type ValidTimestampExtractParts,
  validTimestampExtractParts,
} from '@app-builder/models/astNode/time';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import { dateDocHref } from '@app-builder/services/documentation-href';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import {
  type AstNodeErrors,
  computeValidationForNamedChildren,
} from '@app-builder/services/validation/ast-node-validation';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { type TFunction } from 'i18next';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { assertNever } from 'typescript-utils';
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
  const { org, currentUser } = useOrganizationDetails();
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();
  const [viewModel, setViewModel] = React.useState<TimestampExtractViewModel>(
    () =>
      adaptTimestampExtractViewModel(timestampExtractAstNode, astNodeErrors),
  );

  const handleSave = () => {
    onSave(adaptTimestampExtractAstNode(viewModel));
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
            <span className="first-letter:uppercase">
              {t('scenarios:edit_timestamp_extract.extract_the')}
            </span>
            <Operator
              operators={validTimestampExtractParts}
              value={viewModel.part}
              setValue={(part) =>
                setViewModel({
                  ...viewModel,
                  part,
                })
              }
            />
            <span>{t('scenarios:edit_timestamp_extract.from')}</span>
            <TimestampField
              astNode={viewModel.timestampField.astNode}
              astNodeErrors={viewModel.timestampField.astNodeErrors}
              onChange={(timestampField) =>
                setViewModel({
                  ...viewModel,
                  timestampField: {
                    astNode: timestampField,
                    astNodeErrors: {
                      errors: [],
                      children: [],
                      namedChildren: {},
                    },
                  },
                  errors: {
                    ...viewModel.errors,
                    timestamp: [],
                  },
                })
              }
              validationStatus={
                viewModel.errors.timestamp.length > 0 ? 'error' : 'valid'
              }
            />
          </div>
          <EvaluationErrors
            errors={adaptEvaluationErrorViewModels([
              ...viewModel.errors.timestamp,
            ]).map(getNodeEvaluationErrorMessage)}
          />
        </div>
        <p>{returnTimestampExtractInformation(t, viewModel.part)}</p>
        <p>
          {org.defaultScenarioTimezone
            ? t('scenarios:edit_timestamp_extract.interpreted_in_timezone', {
                replace: { timezone: org.defaultScenarioTimezone },
              })
            : getNoTimezoneSetupWarning(currentUser, t)}
        </p>

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

function getNoTimezoneSetupWarning(
  currentUser: CurrentUser,
  t: TFunction<['scenarios']>,
): React.ReactNode {
  return isAdmin(currentUser) ? (
    <span className="text-red-100">
      <Trans
        t={t}
        i18nKey="scenarios:edit_timestamp_extract.missing_default_timezone_admin"
        components={{
          SettingsLink: (
            <Link
              className="text-m hover:text-purple-120 focus:text-purple-120 relative font-normal text-purple-100 hover:underline focus:underline"
              to={getRoute('/settings/scenarios')}
            />
          ),
        }}
      />
    </span>
  ) : (
    <span className="text-red-100">
      {t('scenarios:edit_timestamp_extract.missing_default_timezone_non_admin')}
    </span>
  );
}

function returnTimestampExtractInformation(
  t: TFunction<['scenarios'], undefined>,
  part: ValidTimestampExtractParts,
): string {
  switch (part) {
    case 'year':
      return t(`scenarios:edit_timestamp_extract.explanation.year`);
    case 'month':
      return t(`scenarios:edit_timestamp_extract.explanation.month`);
    case 'day_of_month':
      return t(`scenarios:edit_timestamp_extract.explanation.day_of_month`);
    case 'day_of_week':
      return t(`scenarios:edit_timestamp_extract.explanation.day_of_week`);
    case 'hour':
      return t(`scenarios:edit_timestamp_extract.explanation.hour`);
    default:
      assertNever('Untranslated operator', part);
  }
}
