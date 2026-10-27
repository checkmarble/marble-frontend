import { describe, expect, it } from 'vitest';
import { block, reference } from '../test-utils/persons-test-data';
import { computePersonRoles } from './roles';

describe('computePersonRoles', () => {
  const pp = block('/ds/personnes/pp', {}, 'pp-1');
  const pm = block(
    '/ds/personnes/pm',
    {
      children: [
        block('/ds/personnes/pm/dirigeant', {
          fields: { '/ds/personnes/pm/dirigeant/idPersonne': [reference('r1', 'pp-1')] },
        }),
      ],
    },
    'pm-1',
  );
  const pnc = block(
    '/ds/personnes/pnc',
    {
      children: [
        block('/ds/personnes/pnc/lienAutrePersonneDejaDeclaree', {
          fields: { '/ds/personnes/pnc/lienAutrePersonneDejaDeclaree/idPersonne': [reference('r2', 'pp-1')] },
        }),
      ],
    },
    'pnc-1',
  );
  const operation = block('/ds/operations/operation', {
    fields: {
      '/ds/operations/operation/emetteurTypeEmetteur': [reference('r3', 'pp-1')],
      '/ds/operations/operation/beneficiaireTypeBeneficiaire': [reference('r4', 'pm-1')],
      '/ds/operations/operation/refFinanciereEmission': [reference('r5', 'support-1', 'pp-1')],
    },
  });
  const root = block('/ds', {
    children: [block('/ds/personnes', { children: [pp, pm, pnc] }), block('/ds/operations', { children: [operation] })],
  });

  it('reads each role of a person from the references that point to it', () => {
    const roles = computePersonRoles(root).get('pp-1')!;
    expect(roles.map((role) => role.kind).sort()).toEqual(['dirigeant', 'emitter', 'relation_target']);
  });

  it('says whose manager or link it is, and nothing for an operation', () => {
    const byKind = Object.fromEntries(
      computePersonRoles(root)
        .get('pp-1')!
        .map((role) => [role.kind, role]),
    );
    expect(byKind['dirigeant']!.holderPersonId).toBe('pm-1');
    expect(byKind['relation_target']!.holderPersonId).toBe('pnc-1');
    expect(byKind['emitter']!.holderPersonId).toBeNull();
  });

  it('gives the beneficiary role to the person named as beneficiary, and ignores references to supports', () => {
    const roles = computePersonRoles(root);
    expect(roles.get('pm-1')!.map((role) => role.kind)).toEqual(['beneficiary']);
    expect(roles.has('support-1')).toBe(false);
  });

  it('has no entry for a person nobody references', () => {
    expect(computePersonRoles(root).has('pnc-1')).toBe(false);
  });
});
