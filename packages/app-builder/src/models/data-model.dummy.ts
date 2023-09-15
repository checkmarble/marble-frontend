import { type DataModel, type DataModelField } from './data-model';

export const accountsTable: DataModel = {
  name: 'accounts',
  fields: [
    {
      name: 'id',
      dataType: 'String',
      description: '',
      nullable: false,
    },
    {
      name: 'name',
      dataType: 'String',
      description: '',
      nullable: false,
    },
  ],
  linksToSingle: [],
};

export const transactionFieldName: DataModelField = {
  name: 'name',
  dataType: 'String',
  description: '',
  nullable: false,
};

export const transactionTable: DataModel = {
  name: 'transactions',
  fields: [
    {
      name: 'id',
      dataType: 'String',
      description: '',
      nullable: false,
    },
    transactionFieldName,
  ],
  linksToSingle: [
    {
      linkName: 'account',
      linkedTableName: 'accounts',
      parentFieldName: '',
      childFieldName: '',
    },
  ],
};

export const accountAndTransactionDataModel: DataModel[] = [
  accountsTable,
  transactionTable,
];
