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
import { getServerEnv } from '@marble-front/builder/utils/environment.server';
import { fromParams, fromUUID } from '@marble-front/builder/utils/short-uuid';
import {
  adaptFormulaDto,
  type AstNode,
  type ConstantType,
  getEmptyNode,
  isOrAndGroup,
  type OperatorNode,
  wrapInOrAndGroups,
} from '@marble-front/operators';
import { getScenarioIterationRule } from '@marble-front/repositories';
import { Button, Input, Tag } from '@marble-front/ui/design-system';
import { Trash } from '@marble-front/ui/icons';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { Fragment, useId } from 'react';
import {
  type Control,
  Controller,
  type FieldArrayPath,
  type FieldPath,
  type FieldValues,
  useController,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { ClientOnly } from 'remix-utils';

export const handle = {
  i18n: [...scenarioI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { tokenService } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const ruleId = fromParams(params, 'ruleId');

  const scenarioIterationRule = await getScenarioIterationRule({
    ruleId,
    tokenService,
    baseUrl: getServerEnv('MARBLE_API_DOMAIN'),
  });

  return json(scenarioIterationRule);
}

export default function RuleView() {
  const rule = useLoaderData<typeof loader>();

  const { control } = useForm({
    defaultValues: {
      astNode: rule.astNode,
    },
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
      <ScenarioPage.Content className="max-w-3xl">
        <Callout>{rule.description}</Callout>
        <div className="max-w flex flex-col gap-4">
          <Consequence scoreIncrease={rule.scoreModifier} />
          <Paper.Container>
            <RootOrOperator control={control} />
          </Paper.Container>
        </div>
        <ClientOnly>
          {() => <DevTool control={control} placement="bottom-left" />}
        </ClientOnly>
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}

function RootOrOperator({
  control,
}: {
  control: Control<{
    astNode: {
      name: 'OR';
      children: {
        name: 'AND';
        children: AstNode[];
        namedChildren: Record<string, AstNode>;
        constant: ConstantType;
      }[];
      namedChildren: Record<string, AstNode>;
      constant: ConstantType;
    };
  }>;
}) {
  const {
    fields: rootOrOperands,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'astNode.children',
  });

  return (
    <div className="flex flex-col gap-2">
      {rootOrOperands.map((operand, operandIndex) => {
        const isFirstOperand = operandIndex === 0;

        return (
          <Fragment key={operand.id}>
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
                  remove(operandIndex);
                }}
                color="red"
                className="peer hidden h-fit w-fit text-xs group-hover:block"
              >
                <Trash />
              </Button>
              <div className="peer-hover:border-grey-25 flex flex-1 flex-col gap-2 rounded border border-transparent p-1">
                <RootOrOperand
                  control={control}
                  name={`astNode.children.${operandIndex}.children`}
                />
              </div>
            </div>
          </Fragment>
        );
      })}
      <Button
        className="w-fit"
        onClick={() => {
          append({
            name: 'AND',
            children: [getEmptyNode()],
            namedChildren: {},
            constant: null,
          });
        }}
      >
        +OR
      </Button>
    </div>
  );
}

function RootOrOperand({
  control,
  name,
}: {
  control: Control<{
    astNode: {
      name: 'OR';
      children: {
        name: 'AND';
        children: AstNode[];
        namedChildren: Record<string, AstNode>;
        constant: ConstantType;
      }[];
      namedChildren: Record<string, AstNode>;
      constant: ConstantType;
    };
  }>;
  name: `astNode.children.${number}.children`;
}) {
  const {
    fields: andOperands,
    remove,
    append,
  } = useFieldArray({
    control,
    name,
  });

  return (
    <>
      {andOperands.map((operand, operandIndex) => {
        return (
          <div
            key={operand.id}
            className="group/or-operand flex flex-row-reverse gap-2"
          >
            <Button
              onClick={() => {
                remove(operandIndex);
              }}
              color="red"
              className="peer hidden h-fit w-fit text-xs group-hover/or-operand:block"
            >
              <Trash />
            </Button>
            <div className="peer-hover:border-grey-25 flex flex-1 flex-col rounded border border-transparent p-1">
              <EditAstNode control={control} name={`${name}.${operandIndex}`} />
            </div>
            <LogicalOperator operator={operandIndex === 0 ? 'if' : 'and'} />
          </div>
        );
      })}
      <Button
        className="text-grey-25 h-fit w-fit text-xs"
        variant="secondary"
        onClick={() => {
          const newNode = getEmptyNode();
          append(newNode);
        }}
      >
        +AND
      </Button>
    </>
  );
}

type NestedAstNodeName<T extends string> = T | `${T}.children.${number}`;

function EditAstNode({
  control,
  name,
  remove,
}: {
  control: Control<{ astNode: AstNode }>;
  name: NestedAstNodeName<`astNode.children.${number}`>;
  remove?: Function;
}) {
  const nodeId = useId();
  const operatorNameId = `${nodeId}-operator-name`;
  const constantId = `${nodeId}-constand`;

  return (
    <div className="flex w-fit flex-row gap-1 rounded border p-1">
      <div className="flex flex-col gap-1 p-1">
        <Controller
          control={control}
          name={`${name}.name`}
          render={({ field, formState, fieldState }) => (
            <div className="flex flex-row items-center gap-1">
              <label htmlFor={operatorNameId}>Operator</label>
              <Input id={operatorNameId} {...field} />
            </div>
          )}
        />
        <Controller
          control={control}
          name={`${name}.constant`}
          render={({ field, formState, fieldState }) => (
            <div className="flex flex-row items-center gap-1">
              <label htmlFor={constantId}>constant</label>
              <Input id={constantId} {...field} />
            </div>
          )}
        />
        <FormChildren name={`${name}.children`} control={control} />
        {/* <FormNamedChildren name={`${name}.namedChildren`} control={control} /> */}
      </div>
      {remove && (
        <Button
          onClick={() => {
            remove();
          }}
          color="red"
          className="h-fit w-fit text-xs"
        >
          <Trash />
        </Button>
      )}
    </div>
  );
}

function FormChildren({ name, control }: { name: string; control: any }) {
  const { fields, append, remove } = useFieldArray({ name, control });
  return (
    <div>
      <p>Children</p>
      {fields.map((child, index) => (
        <EditAstNode
          key={child.id}
          name={`${name}.${index}`}
          control={control}
          remove={() => {
            remove(index);
          }}
        />
      ))}
      <Button
        onClick={() => {
          append(getEmptyNode());
        }}
      >
        + child
      </Button>
    </div>
  );
}

// function FormNamedChildren({ name, control }: { name: string; control: any }) {
//   const { fields, append, remove } = useFieldArray({ name });
//   return (
//     <div>
//       <p>Named Children</p>
//       {fields.map((child, index) => (
//         <div key={child.id} className="flex flex-row gap-1">
//           <Input {...register(`${name}.key`)} />
//           <Node
//             name={`${name}.value`}
//             register={register}
//             remove={() => {
//               remove(index);
//             }}
//           />
//         </div>
//       ))}
//       <Button
//         onClick={() => {
//           append({ name: '', value: getEmptyNode() });
//         }}
//       >
//         + namedChildren
//       </Button>
//     </div>
//   );
// }
