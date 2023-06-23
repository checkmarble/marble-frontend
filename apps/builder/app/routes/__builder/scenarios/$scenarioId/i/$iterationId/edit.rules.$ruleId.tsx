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
import {
  Button,
  ComboBox,
  Input,
  Select,
  Tag,
} from '@marble-front/ui/design-system';
import { Trash } from '@marble-front/ui/icons';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { forwardRef, Fragment, useId, useMemo, useState } from 'react';
import {
  type Control,
  type FieldArrayPath,
  type FieldValues,
  FormProvider,
  useController,
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
  } satisfies OperatorNode;

  return json({ ...rule, formula });
}

export default function RuleView() {
  const rule = useLoaderData<typeof loader>();

  const form = useForm({
    defaultValues: {
      root: getEmptyNode(),
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
      <ScenarioPage.Content>
        <Callout>{rule.description}</Callout>
        <div className="flex flex-col gap-4">
          <Consequence scoreIncrease={rule.scoreModifier} />
          <Paper.Container>
            <NewFormula node={rule.formula} isRoot />
          </Paper.Container>
          <FormProvider {...form}>
            <Node register={form.register} name="root" />
          </FormProvider>
        </div>
        <ClientOnly>
          {() => <DevTool control={form.control} placement="bottom-left" />}
        </ClientOnly>
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}

const getOperandList = () => {
  return [
    {
      node: {
        operatorName: 'DB_FIELD_FLOAT',
        namedChildren: {
          triggerTableName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'transaction',
          },
          path: {
            operatorName: 'STRING_LIST_CONSTANT',
            constant: [],
          },
          fieldName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'amount',
          },
        },
      },
      stringValue: 'transaction.amount',
    },
    {
      node: {
        operatorName: 'DB_FIELD_FLOAT',
        namedChildren: {
          triggerTableName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'transaction',
          },
          path: {
            operatorName: 'STRING_LIST_CONSTANT',
            constant: [],
          },
          fieldName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'direction',
          },
        },
      },
      stringValue: 'transaction.direction',
    },
    {
      node: {
        operatorName: 'DB_FIELD_FLOAT',
        namedChildren: {
          triggerTableName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'transaction',
          },
          path: {
            operatorName: 'STRING_LIST_CONSTANT',
            constant: [],
          },
          fieldName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'description',
          },
        },
      },
      stringValue: 'transaction.description',
    },
    {
      node: {
        operatorName: 'DB_FIELD_FLOAT',
        namedChildren: {
          triggerTableName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'transaction',
          },
          path: {
            operatorName: 'STRING_LIST_CONSTANT',
            constant: [],
          },
          fieldName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'date',
          },
        },
      },
      stringValue: 'transaction.date',
    },
    {
      node: {
        operatorName: 'DB_FIELD_FLOAT',
        namedChildren: {
          triggerTableName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'transaction',
          },
          path: {
            operatorName: 'STRING_LIST_CONSTANT',
            constant: [],
          },
          fieldName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'category',
          },
        },
      },
      stringValue: 'transaction.category',
    },
    {
      node: {
        operatorName: 'DB_FIELD_FLOAT',
        namedChildren: {
          triggerTableName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'transaction',
          },
          path: {
            operatorName: 'STRING_LIST_CONSTANT',
            constant: [],
          },
          fieldName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'account',
          },
        },
      },
      stringValue: 'transaction.account',
    },
    {
      node: {
        operatorName: 'DB_FIELD_FLOAT',
        namedChildren: {
          triggerTableName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'transaction',
          },
          path: {
            operatorName: 'STRING_LIST_CONSTANT',
            constant: [],
          },
          fieldName: {
            operatorName: 'STRING_CONSTANT',
            constant: 'tags',
          },
        },
      },
      stringValue: 'transaction.tags',
    },
  ] satisfies Item[];
};

type Item = {
  node: OperatorNode;
  stringValue: string;
};

const BasicSelect = forwardRef(({ onChange, name, value }, ref) => {
  const [inputValue, setInputValue] = useState('');
  const operands = useMemo(() => getOperandList(), []);

  const lowerCasedInputValue = inputValue.toLowerCase();
  const items = operands.filter(({ stringValue }) =>
    stringValue.toLowerCase().includes(lowerCasedInputValue)
  );

  return (
    <ComboBox
      ref={ref}
      name={name}
      onInputValueChange={({ inputValue }) => setInputValue(inputValue ?? '')}
      items={items}
      onSelectedItemChange={({ selectedItem }) => {
        onChange(selectedItem.node);
      }}
      selectedItem={value as Item}
      renderItemInList={({
        item: { node, stringValue },
        isHighlighted,
        isSelected,
      }) => (
        <div
          className={clsx(
            'flex flex-col gap-1 p-1',
            isHighlighted && 'bg-purple-05 text-purple-100',
            isSelected && 'text-purple-100'
          )}
        >
          <p>{stringValue}</p>
          <p className="text-grey-25 text-xs">{node.operatorName}</p>
        </div>
      )}
      itemToKey={({ node }) => JSON.stringify(node)}
      itemToString={(item) => item?.stringValue ?? ''}
    />
  );
});

type ViewModel = {
  operatorName: string;
  namedChildren?: Record<string, ViewModel>;
  constant?: any;
  children?: ViewModel[];
};

function Node({
  name,
  register,
  remove,
}: {
  name: string;
  register: Function;
  remove?: Function;
}) {
  const nodeId = useId();
  const operatorNameId = `${nodeId}-operator-name`;
  const constantId = `${nodeId}-constand`;

  return (
    <div className="flex flex-row gap-1 rounded border p-1">
      <div className="flex flex-col gap-1 p-1">
        <div className="flex flex-row items-center gap-1">
          <label htmlFor={operatorNameId}>Operator</label>
          <Input id={operatorNameId} {...register(`${name}.operatorName`)} />
        </div>
        <div className="flex flex-row items-center gap-1">
          <label htmlFor={constantId}>constant</label>
          <Input id={constantId} {...register(`${name}.constant`)} />
        </div>
        <FormChildren name={`${name}.children`} register={register} />
        <FormNamedChildren name={`${name}.namedChildren`} register={register} />
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

const getEmptyNode = () => ({
  operatorName: '',
  namedChildren: [],
  constant: null,
  children: [],
});

function FormChildren({
  name,
  register,
}: {
  name: string;
  register: Function;
}) {
  const { fields, append, remove } = useFieldArray({ name });
  return (
    <div>
      <p>Children</p>
      {fields.map((child, index) => (
        <Node
          key={child.id}
          name={`${name}.${index}`}
          register={register}
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

function FormNamedChildren({
  name,
  register,
}: {
  name: string;
  register: Function;
}) {
  const { fields, append, remove } = useFieldArray({ name });
  return (
    <div>
      <p>Named Children</p>
      {fields.map((child, index) => (
        <div key={child.id} className="flex flex-row gap-1">
          <Input {...register(`${name}.key`)} />
          <Node
            name={`${name}.value`}
            register={register}
            remove={() => {
              remove(index);
            }}
          />
        </div>
      ))}
      <Button
        onClick={() => {
          append({ name: '', value: getEmptyNode() });
        }}
      >
        + namedChildren
      </Button>
    </div>
  );
}
