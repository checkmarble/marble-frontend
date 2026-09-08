import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { isListAstNode, NewListAstNode } from '@app-builder/models/astNode/list';
import { isStringConcatAstNode, NewStringConcatAstNode } from '@app-builder/models/astNode/strings';
import { describe, expect, it } from 'vitest';

import { normalizeScreeningQueryLists } from './screening-config';

describe('normalizeScreeningQueryLists', () => {
  it('nests a legacy name StringConcat and converts ordinary fields to flat lists', () => {
    const nameChild = NewConstantAstNode({ constant: 'ACME' });
    const countryChild = NewConstantAstNode({ constant: 'FR' });
    const legacyName = NewStringConcatAstNode([nameChild]);
    const legacyCountry = NewStringConcatAstNode([countryChild]);
    const query = normalizeScreeningQueryLists({
      name: legacyName,
      country: legacyCountry,
    });

    expect(query.name && isListAstNode(query.name)).toBe(true);
    expect(query.name?.children).toEqual([legacyName]);
    expect(query['country'] && isListAstNode(query['country'])).toBe(true);
    expect(query['country']?.id).toBe(legacyCountry.id);
    expect(query['country']?.children).toEqual([countryChild]);
  });

  it('wraps legacy flat address items in individual StringConcat nodes', () => {
    const first = NewConstantAstNode({ constant: 'street' });
    const second = NewConstantAstNode({ constant: 'city' });
    const legacyAddress = NewListAstNode([first, second]);
    const query = normalizeScreeningQueryLists({ address: legacyAddress });

    expect(query['address']?.id).toBe(legacyAddress.id);
    expect(query['address']?.children).toHaveLength(2);
    expect(query['address']?.children.every(isStringConcatAstNode)).toBe(true);
    expect(query['address']?.children.map((concat) => concat.children)).toEqual([[first], [second]]);
  });

  it('keeps an already nested list stable', () => {
    const nested = NewListAstNode([NewStringConcatAstNode([NewConstantAstNode({ constant: 'ACME' })])]);

    expect(normalizeScreeningQueryLists({ name: nested }).name).toBe(nested);
  });

  it('keeps only the first concat in a legacy multi-row name', () => {
    const first = NewStringConcatAstNode([NewConstantAstNode({ constant: 'ACME' })]);
    const second = NewStringConcatAstNode([NewConstantAstNode({ constant: 'Corp' })]);
    const query = normalizeScreeningQueryLists({ name: NewListAstNode([first, second]) });

    expect(query.name?.children).toEqual([first]);
  });
});
