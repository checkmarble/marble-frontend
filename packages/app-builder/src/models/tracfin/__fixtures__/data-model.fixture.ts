import type {
  DataModel,
  DataModelField,
  LinkToSingle,
  NavigationOption,
  TableModel,
} from '@app-builder/models/data-model';

/**
 * A small organisation data model for the TRACFIN configuration screen, with the shapes
 * `adaptDataModel` produces:
 *
 * - `users` (natural person) and `companies` (legal person) are ingested roots, `partners` (generic
 *   person) is not.
 * - `users` has two different links to the same `companies` table (`employer`,
 *   `affiliated_company`), which are forward hops from `users`.
 * - `accounts.user` and `cards.account` are inverse hops from `users` and `accounts`; both have a
 *   valid navigation option. `loans.borrower` is an inverse hop from `users` without navigation
 *   option, so that hop is not indexed.
 * - `transactions` is only used as a historical type of decision snapshots.
 */

function field(table: string, name: string, dataType: DataModelField['dataType'] = 'String'): DataModelField {
  return {
    id: `${table}.${name}`,
    dataType,
    description: '',
    isEnum: false,
    name,
    nullable: true,
    tableId: table,
    unicityConstraint: 'no_unicity_constraint',
  };
}

function link(name: string, child: string, childField: string, parent: string): LinkToSingle {
  return {
    id: `${child}.${name}`,
    name,
    parentTableName: parent,
    parentTableId: parent,
    parentFieldName: 'object_id',
    parentFieldId: `${parent}.object_id`,
    childTableName: child,
    childTableId: child,
    childFieldName: childField,
    childFieldId: `${child}.${childField}`,
    relationType: 'belongs_to',
  };
}

function navigation(source: string, target: string, filterField: string, status: NavigationOption['status']) {
  return {
    id: `${source}->${target}`,
    sourceTableName: source,
    sourceTableId: source,
    sourceFieldName: 'object_id',
    sourceFieldId: `${source}.object_id`,
    targetTableName: target,
    targetTableId: target,
    filterFieldName: filterField,
    filterFieldId: `${target}.${filterField}`,
    orderingFieldName: 'updated_at',
    orderingFieldId: `${target}.updated_at`,
    status,
  } satisfies NavigationOption;
}

function table(
  name: string,
  semantic: Pick<TableModel, 'semanticType' | 'subEntity'>,
  fieldNames: string[],
  links: LinkToSingle[] = [],
  navigationOptions: NavigationOption[] = [],
): TableModel {
  return {
    id: name,
    name,
    description: '',
    alias: name,
    captionField: 'object_id',
    ...semantic,
    fields: ['object_id', ...fieldNames].map((fieldName) => field(name, fieldName)),
    linksToSingle: links,
    navigationOptions,
    fieldOrder: ['object_id', ...fieldNames],
  };
}

export const tracfinDataModelFixture: DataModel = [
  table(
    'users',
    { semanticType: 'person', subEntity: 'natural' },
    ['last_name', 'first_name', 'gender', 'employer_name', 'employer_id', 'affiliated_company_id'],
    [
      link('employer', 'users', 'employer_id', 'companies'),
      link('affiliated_company', 'users', 'affiliated_company_id', 'companies'),
    ],
    [navigation('users', 'accounts', 'user_id', 'valid')],
  ),
  table('companies', { semanticType: 'person', subEntity: 'moral' }, ['name', 'registration_number']),
  table('partners', { semanticType: 'person', subEntity: 'generic' }, ['name']),
  table(
    'accounts',
    { semanticType: 'account', subEntity: null },
    ['user_id', 'balance'],
    [link('user', 'accounts', 'user_id', 'users')],
    [navigation('accounts', 'cards', 'account_id', 'valid')],
  ),
  table(
    'cards',
    { semanticType: 'other', subEntity: null },
    ['account_id', 'number'],
    [link('account', 'cards', 'account_id', 'accounts')],
  ),
  table(
    'loans',
    { semanticType: 'other', subEntity: null },
    ['borrower_id', 'amount'],
    [link('borrower', 'loans', 'borrower_id', 'users')],
  ),
  table('transactions', { semanticType: 'transaction', subEntity: null }, [
    'amount',
    'currency',
    'channel',
    'direction',
  ]),
];
