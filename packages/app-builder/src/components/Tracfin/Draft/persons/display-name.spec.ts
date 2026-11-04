import { describe, expect, it } from 'vitest';
import { block, text } from '../test-utils/persons-test-data';
import { personDisplayName } from './display-name';

const civil = (fields: Record<string, string[]>) =>
  block('/ds/personnes/pp/etatCivil', {
    fields: Object.fromEntries(
      Object.entries(fields).map(([name, values]) => [
        `/ds/personnes/pp/etatCivil/${name}`,
        values.map((value, index) => text(`${name}-${index}`, value)),
      ]),
    ),
  });

describe('personDisplayName', () => {
  it('names a natural person after the first name and the birth name of its civil status', () => {
    const pp = block('/ds/personnes/pp', {
      children: [civil({ prenom: ['Jeanne', 'Marie'], nomNaissance: ['Martin'] })],
    });
    expect(personDisplayName(pp, 'pp')).toBe('Jeanne Martin');
  });

  it('falls back to the name of use, and to the first name alone', () => {
    expect(personDisplayName(block('/ds/personnes/pp', { children: [civil({ nomDusage: ['Durand'] })] }), 'pp')).toBe(
      'Durand',
    );
    expect(personDisplayName(block('/ds/personnes/pp', { children: [civil({ prenom: ['Jeanne'] })] }), 'pp')).toBe(
      'Jeanne',
    );
  });

  it('has no name for a person with nothing entered, or with blank or cleared values', () => {
    expect(personDisplayName(block('/ds/personnes/pp'), 'pp')).toBeNull();
    const blank = block('/ds/personnes/pp', {
      children: [
        block('/ds/personnes/pp/etatCivil', {
          fields: {
            '/ds/personnes/pp/etatCivil/nomNaissance': [text('a', '  '), { id: 'b', kind: 'cleared' }],
          },
        }),
      ],
    });
    expect(personDisplayName(blank, 'pp')).toBeNull();
  });

  it('names a legal entity after its company name, else its trade name', () => {
    const entity = (fields: Record<string, string>) =>
      block('/ds/personnes/pm', {
        children: [
          block('/ds/personnes/pm/activiteCoordonnee', {
            fields: Object.fromEntries(
              Object.entries(fields).map(([name, value]) => [
                `/ds/personnes/pm/activiteCoordonnee/${name}`,
                [text(name, value)],
              ]),
            ),
          }),
        ],
      });
    expect(personDisplayName(entity({ denominationSociale: 'ACME SAS', enseigneSigle: 'ACME' }), 'pm')).toBe(
      'ACME SAS',
    );
    expect(personDisplayName(entity({ enseigneSigle: 'ACME' }), 'pm')).toBe('ACME');
    expect(personDisplayName(block('/ds/personnes/pm'), 'pm')).toBeNull();
  });

  it('names a non-customer person after its identification elements, else its involvement, cut when long', () => {
    const withFields = (fields: Record<string, string>) =>
      block('/ds/personnes/pnc', {
        fields: Object.fromEntries(
          Object.entries(fields).map(([name, value]) => [`/ds/personnes/pnc/${name}`, [text(name, value)]]),
        ),
      });
    expect(
      personDisplayName(withFields({ elementsIdentification: 'Homme, 40 ans', implication: 'Témoin' }), 'pnc'),
    ).toBe('Homme, 40 ans');
    expect(personDisplayName(withFields({ implication: 'Témoin' }), 'pnc')).toBe('Témoin');
    expect(personDisplayName(withFields({ implication: 'x'.repeat(200) }), 'pnc')).toHaveLength(60);
  });
});
