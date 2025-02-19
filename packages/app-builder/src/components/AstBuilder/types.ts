import { type AstNode } from '@app-builder/models';
import { type CustomList } from '@app-builder/models/custom-list';
import { type TFunction } from 'i18next';

type TFunctionDisplayName = TFunction<['common', 'scenarios'], undefined>;
export type AstNodeStringifierContext = {
  t: TFunctionDisplayName;
  language: string;
  customLists: CustomList[];
};

export type AstBuilderBaseProps<T extends AstNode = AstNode> = {
  node: T;
};
