export interface DBFieldBoolOperator {
  type: 'DB_FIELD_BOOL';
  staticData: {
    path: string[];
    fieldName: string;
  };
}
