import { DevTool } from '@hookform/devtools';
import {
  Callout,
  Paper,
  scenarioI18n,
  ScenarioPage,
} from '@marble-front/builder/components';
import { NewFormula } from '@marble-front/builder/components/Scenario/Formula';
import { LogicalOperator } from '@marble-front/builder/components/Scenario/LogicalOperator';
import { Consequence } from '@marble-front/builder/components/Scenario/Rule/Consequence';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { fromParams, fromUUID } from '@marble-front/builder/utils/short-uuid';
import { type OperatorNode } from '@marble-front/operators';
import { Button, Tag } from '@marble-front/ui/design-system';
import { Trash } from '@marble-front/ui/icons';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { Fragment } from 'react';
import {
  type Control,
  type FieldArrayPath,
  type FieldValues,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { ClientOnly } from 'remix-utils';

export const handle = {
  i18n: [...scenarioI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const ruleId = fromParams(params, 'ruleId');

  const rule = await apiClient.getScenarioIterationRule(ruleId);

  const formula = {
    operatorName: 'OR',
    children: [
      {
        operatorName: 'AND',
        children: [
          {
            operatorName: 'GREATER',
            children: [
              {
                operatorName: 'AND',
                children: [
                  {
                    operatorName: 'FLOAT_CONSTANT',
                    constant: 3,
                  },
                  {
                    operatorName: 'FLOAT_CONSTANT',
                    constant: 35,
                  },
                ],
              },
              {
                operatorName: 'DB_FIELD_FLOAT',
                namedChildren: {
                  triggerTableName: {
                    operatorName: 'STRING_CONSTANT',
                    constant: 'tableName',
                  },
                  path: {
                    operatorName: 'STRING_LIST_CONSTANT',
                    constant: ['path', 'to'],
                  },
                  fieldName: {
                    operatorName: 'STRING_CONSTANT',
                    constant: 'fieldName',
                  },
                },
              },
            ],
          },
          {
            operatorName: 'GREATER',
            children: [
              {
                operatorName: 'FLOAT_CONSTANT',
                constant: 3,
              },
              {
                operatorName: 'DB_FIELD_FLOAT',
                namedChildren: {
                  triggerTableName: {
                    operatorName: 'STRING_CONSTANT',
                    constant: 'tableName',
                  },
                  path: {
                    operatorName: 'STRING_LIST_CONSTANT',
                    constant: ['path', 'to'],
                  },
                  fieldName: {
                    operatorName: 'STRING_CONSTANT',
                    constant: 'fieldName',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  } satisfies OperatorNode;

  return json({ ...rule, formula });
}

export default function RuleView() {
  const rule = useLoaderData<typeof loader>();

  const { control, register } = useForm({
    defaultValues: {
      formula: rule.formula,
    },
  });
  const orChildrenFieldArray = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'formula.children', // unique name for your Field Array
  });

  return (
    <ScenarioPage.Container>
      <ScenarioPage.Header>
        <div className="flex flex-row items-center gap-4">
          <Link to="./..">
            <ScenarioPage.BackButton />
          </Link>
          {rule.name ?? fromUUID(rule.id)}
          <Tag size="big" border="square">
            Edit
          </Tag>
        </div>
      </ScenarioPage.Header>
      <ScenarioPage.Content>
        <Callout>{rule.description}</Callout>
        <div className="flex flex-col gap-4">
          <Consequence scoreIncrease={rule.scoreModifier} />
          <Paper.Container>
            <div className="flex flex-col gap-2">
              {orChildrenFieldArray.fields.map(
                (rootOperand, rootOperandIndex) => {
                  const isFirstOperand = rootOperandIndex === 0;

                  return (
                    <Fragment key={rootOperand.id}>
                      {!isFirstOperand && (
                        <div className="flex flex-row">
                          <LogicalOperator
                            operator="or"
                            className="bg-grey-02 uppercase"
                          />
                          <div className="flex flex-1 items-center">
                            <div className="bg-grey-10 h-[1px] w-full" />
                          </div>
                        </div>
                      )}
                      <div className="group flex flex-row-reverse gap-2">
                        <Button
                          onClick={() => {
                            orChildrenFieldArray.remove(rootOperandIndex);
                          }}
                          color="red"
                          className="peer hidden h-fit w-fit text-xs group-hover:block"
                        >
                          <Trash />
                        </Button>
                        <div className="peer-hover:border-grey-25 flex flex-1 flex-col gap-2 rounded border border-transparent p-1">
                          <OrOperand
                            control={control}
                            {...register(
                              `formula.children.${rootOperandIndex}.children`
                            )}
                          />
                        </div>
                      </div>
                    </Fragment>
                  );
                }
              )}
              <Button
                className="w-fit"
                onClick={() => {
                  orChildrenFieldArray.append({
                    type: 'AND',
                    children: [
                      {
                        operatorName: 'GREATER',
                        children: [
                          {
                            operatorName: 'FLOAT_CONSTANT',
                            constant: 3,
                          },
                          {
                            operatorName: 'DB_FIELD_FLOAT',
                            namedChildren: {
                              triggerTableName: {
                                operatorName: 'STRING_CONSTANT',
                                constant: 'tableName',
                              },
                              path: {
                                operatorName: 'STRING_LIST_CONSTANT',
                                constant: ['path', 'to'],
                              },
                              fieldName: {
                                operatorName: 'STRING_CONSTANT',
                                constant: 'fieldName',
                              },
                            },
                          },
                        ],
                      },
                    ],
                  });
                }}
              >
                +OR
              </Button>
            </div>
          </Paper.Container>
        </div>
        <ClientOnly>
          {() => <DevTool control={control} placement="bottom-left" />}
        </ClientOnly>
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}

function OrOperand<
  TFieldValues extends OperatorNode,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>
>({
  control,
  name,
}: {
  control: Control<TFieldValues>;
  name: TFieldArrayName;
}) {
  const foo = useFieldArray({
    control,
    name,
  });

  return (
    <>
      {foo.fields.map((nestedOperand, nestedOperandIndex) => {
        return (
          <div
            key={`nested_operand_${nestedOperandIndex}`}
            className="group/or-operand flex flex-row-reverse gap-2"
          >
            <Button
              onClick={() => {
                foo.remove(nestedOperand.id);
              }}
              color="red"
              className="peer hidden h-fit w-fit text-xs group-hover/or-operand:block"
            >
              <Trash />
            </Button>
            <div className="peer-hover:border-grey-25 flex flex-1 flex-col rounded border border-transparent p-1">
              <NewFormula node={nestedOperand} isRoot />
            </div>
            <LogicalOperator
              operator={nestedOperandIndex === 0 ? 'if' : 'and'}
            />
          </div>
        );
      })}
      <Button
        className="text-grey-25 h-fit w-fit text-xs"
        variant="secondary"
        onClick={() => {
          foo.append({
            operatorName: 'GREATER',
            children: [
              {
                operatorName: 'FLOAT_CONSTANT',
                constant: 3,
              },
              {
                operatorName: 'DB_FIELD_FLOAT',
                namedChildren: {
                  triggerTableName: {
                    operatorName: 'STRING_CONSTANT',
                    constant: 'tableName',
                  },
                  path: {
                    operatorName: 'STRING_LIST_CONSTANT',
                    constant: ['path', 'to'],
                  },
                  fieldName: {
                    operatorName: 'STRING_CONSTANT',
                    constant: 'fieldName',
                  },
                },
              },
            ],
          });
        }}
      >
        +AND
      </Button>
    </>
  );
}
