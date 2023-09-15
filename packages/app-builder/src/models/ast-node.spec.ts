import { NewAstNode } from './ast-node';

describe('NewAstNode', () => {
  it('return an Ast of constant given a constant', () => {
    expect(NewAstNode({ constant: 42 })).toStrictEqual({
      name: null,
      constant: 42,
      children: [],
      namedChildren: {},
    });
  });

  it('return an Ast of function given a function name', () => {
    expect(NewAstNode({ name: 'SomeFunction' })).toStrictEqual({
      name: 'SomeFunction',
      constant: undefined,
      children: [],
      namedChildren: {},
    });
  });
});
