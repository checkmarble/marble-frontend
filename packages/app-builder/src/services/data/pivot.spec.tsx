import {
  type DataModel,
  type DataModelField,
  type DataType,
  type TableModel,
} from '@app-builder/models';

import { getPivotOptions, type PivotOption } from './pivot';

describe('getPivotOptions', () => {
  it('should only keep String field', () => {
    const tableModel: TableModel = helperTable({
      id: '1',
      fields: helperFields([
        'String',
        'Int',
        'Float',
        'Bool',
        'String[]',
        'Int[]',
        'Float[]',
      ]),
      linksToSingle: [],
    });
    const dataModel: DataModel = [tableModel];

    const expected: PivotOption[] = [
      {
        baseTableId: '1',
        displayValue: 'field1',
        fieldId: '1',
        id: '1',
        type: 'field',
      },
    ];

    const pivotOptions = getPivotOptions(tableModel, dataModel);
    expect(pivotOptions).toMatchObject(expected);
  });

  it('should return link pivot', () => {
    const tableModel: TableModel = helperTable({
      id: '1',
      fields: helperFields(['Int']),
      linksToSingle: [
        {
          id: '1',
          name: 'link1',
          parentTableName: 'table2',
          parentTableId: '2',
          parentFieldName: 'field1',
          parentFieldId: '1',
          childTableName: 'table1',
          childTableId: '1',
          childFieldName: 'field1',
          childFieldId: '1',
        },
      ],
    });
    const dataModel: DataModel = [
      tableModel,
      helperTable({
        id: '2',
        fields: helperFields(['String']),
        linksToSingle: [],
      }),
    ];

    const expected: PivotOption[] = [
      {
        baseTableId: '1',
        displayValue: 'link1',
        id: '1',
        pathLinkIds: ['1'],
        type: 'link',
      },
    ];

    const pivotOptions = getPivotOptions(tableModel, dataModel);
    expect(pivotOptions).toMatchObject(expected);
  });

  it('should ignore link pivot that point to non String field', () => {
    const tableModel: TableModel = helperTable({
      id: '1',
      fields: helperFields(['Int']),
      linksToSingle: [
        {
          id: '1',
          name: 'link1',
          parentTableName: 'table2',
          parentTableId: '2',
          parentFieldName: 'field1',
          parentFieldId: '1',
          childTableName: 'table1',
          childTableId: '1',
          childFieldName: 'field1',
          childFieldId: '1',
        },
      ],
    });
    const dataModel: DataModel = [
      tableModel,
      helperTable({
        id: '2',
        fields: helperFields(['Int']),
        linksToSingle: [],
      }),
    ];

    const expected: PivotOption[] = [];

    const pivotOptions = getPivotOptions(tableModel, dataModel);
    expect(pivotOptions).toMatchObject(expected);
  });

  it('should recursively scan links', () => {
    const tableModel: TableModel = helperTable({
      id: '1',
      fields: helperFields(['Int']),
      linksToSingle: [
        {
          id: '1',
          name: 'link1',
          parentTableName: 'table2',
          parentTableId: '2',
          parentFieldName: 'field1',
          parentFieldId: '1',
          childTableName: 'table1',
          childTableId: '1',
          childFieldName: 'field1',
          childFieldId: '1',
        },
      ],
    });
    const dataModel: DataModel = [
      tableModel,
      helperTable({
        id: '2',
        fields: helperFields(['Int']),
        linksToSingle: [
          {
            id: '2',
            name: 'link2',
            parentTableName: 'table3',
            parentTableId: '3',
            parentFieldName: 'field1',
            parentFieldId: '1',
            childTableName: 'table2',
            childTableId: '2',
            childFieldName: 'field1',
            childFieldId: '1',
          },
        ],
      }),
      helperTable({
        id: '3',
        fields: helperFields(['String']),
        linksToSingle: [],
      }),
    ];

    const expected: PivotOption[] = [
      {
        baseTableId: '1',
        displayValue: 'link1.link2',
        id: '1.2',
        pathLinkIds: ['1', '2'],
        type: 'link',
      },
    ];

    const pivotOptions = getPivotOptions(tableModel, dataModel);
    expect(pivotOptions).toMatchObject(expected);
  });

  it('should not allow loops while scanning links to avoid infinite recursion', () => {
    const tableModel: TableModel = helperTable({
      id: '1',
      fields: helperFields(['Int', 'Int']),
      linksToSingle: [
        {
          id: '1',
          name: 'link1',
          parentTableName: 'table2',
          parentTableId: '2',
          parentFieldName: 'field1',
          parentFieldId: '1',
          childTableName: 'table1',
          childTableId: '1',
          childFieldName: 'field1',
          childFieldId: '1',
        },
      ],
    });
    const dataModel: DataModel = [
      tableModel,
      helperTable({
        id: '2',
        fields: helperFields(['Int', 'Int', 'Int']),
        linksToSingle: [
          {
            id: '2',
            name: 'link2',
            parentTableName: 'table3',
            parentTableId: '3',
            parentFieldName: 'field1',
            parentFieldId: '1',
            childTableName: 'table2',
            childTableId: '2',
            childFieldName: 'field1',
            childFieldId: '1',
          },
          {
            id: '3',
            name: 'link3',
            parentTableName: 'table1',
            parentTableId: '1',
            parentFieldName: 'field2',
            parentFieldId: '2',
            childTableName: 'table2',
            childTableId: '2',
            childFieldName: 'field1',
            childFieldId: '1',
          },
        ],
      }),
      helperTable({
        id: '3',
        fields: helperFields(['String']),
        linksToSingle: [],
      }),
    ];

    const expected: PivotOption[] = [
      {
        baseTableId: '1',
        displayValue: 'link1.link2',
        id: '1.2',
        pathLinkIds: ['1', '2'],
        type: 'link',
      },
    ];

    const pivotOptions = getPivotOptions(tableModel, dataModel);
    expect(pivotOptions).toMatchObject(expected);
  });
});

function helperTable(
  args: Pick<TableModel, 'id' | 'fields' | 'linksToSingle'>,
): TableModel {
  return {
    ...args,
    name: `table${args.id}`,
    description: '',
  };
}

function helperFields(dataTypes: DataType[]): DataModelField[] {
  return dataTypes.map((dataType, idx): DataModelField => {
    const id = `${idx + 1}`;
    return {
      id,
      dataType,
      name: `field${id}`,
      // above values are not impactfull in this test and are just for the sake of completion
      description: '',
      tableId: '1',
      isEnum: false,
      nullable: false,
      unicityConstraint: 'no_unicity_constraint',
    };
  });
}
