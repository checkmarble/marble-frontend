import { describe, expect, it } from 'vitest';
import { MIN_COLUMN_WIDTH, reconcileColumnPrefs } from './column-prefs';

const fields = [{ name: 'id' }, { name: 'amount' }, { name: 'internal', hidden: true }, { name: 'status' }];

describe('reconcileColumnPrefs', () => {
  it('defaults to non-hidden fields in data model order when nothing usable is stored', () => {
    const defaults = { visible: ['id', 'amount', 'status'], pinned: [], widths: {} };

    expect(reconcileColumnPrefs(null, fields)).toEqual(defaults);
    expect(reconcileColumnPrefs({ visible: 'id' }, fields)).toEqual(defaults);
    expect(reconcileColumnPrefs({ visible: ['deleted_field'], pinned: [] }, fields)).toEqual(defaults);
  });

  it('keeps the stored order, including fields hidden by default', () => {
    expect(reconcileColumnPrefs({ visible: ['status', 'internal', 'id'], pinned: ['status'] }, fields)).toEqual({
      visible: ['status', 'internal', 'id'],
      pinned: ['status'],
      widths: {},
    });
  });

  it('drops unknown and duplicated columns, and pins that are not visible', () => {
    expect(
      reconcileColumnPrefs(
        { visible: ['id', 'deleted_field', 'id', 'amount'], pinned: ['deleted_field', 'status', 'id'] },
        fields,
      ),
    ).toEqual({ visible: ['id', 'amount'], pinned: ['id'], widths: {} });
  });

  it('keeps the widths of existing columns, hidden ones included, at least at the minimum width', () => {
    const stored = { visible: ['id'], pinned: [], widths: { id: 240, amount: 10, deleted_field: 300 } };

    expect(reconcileColumnPrefs(stored, fields).widths).toEqual({ id: 240, amount: MIN_COLUMN_WIDTH });
  });

  it('ignores unusable widths without losing the columns', () => {
    expect(
      reconcileColumnPrefs({ visible: ['status'], pinned: ['status'], widths: { status: 'wide' } }, fields),
    ).toEqual({
      visible: ['status'],
      pinned: ['status'],
      widths: {},
    });
  });

  it('orders pinned columns like the visible ones', () => {
    expect(
      reconcileColumnPrefs({ visible: ['id', 'amount', 'status'], pinned: ['status', 'id'] }, fields).pinned,
    ).toEqual(['id', 'status']);
  });
});
