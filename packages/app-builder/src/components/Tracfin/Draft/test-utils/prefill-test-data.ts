import type { TracfinCatalog, TracfinDraft } from '@app-builder/models/tracfin';
import { getTracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { entry, findByCatalogId } from './draft-test-data';
import { personsDraft, personsTestCatalog, text } from './persons-test-data';

/** The persons catalog plus the declaration period of the operations block. */
export const prefillTestCatalog: TracfinCatalog = {
  ...personsTestCatalog,
  profile: {
    ...personsTestCatalog.profile,
    hash: 'prefill-test-profile',
    fields: {
      ...personsTestCatalog.profile.fields,
      '/ds/operations/dateDebut': entry('/ds/operations/dateDebut', '/ds/operations', 'field', '0', '1'),
      '/ds/operations/dateFin': entry('/ds/operations/dateFin', '/ds/operations', 'field', '0', '1'),
    },
  },
};
export const prefillTestIndex = getTracfinCatalogIndex(prefillTestCatalog.profile);

export const IDS = { pp: 'pp-1', civil: 'civil-1', activity: 'activity-1', operations: 'operations-1' } as const;
export const CIVIL = '/ds/personnes/pp/etatCivil';
export const ACTIVITY_NAME = '/ds/personnes/pp/activite/denominationSociale';

const manual = { source: 'manual' as const, resolution: 'resolved' as const };

/**
 * A draft with one natural person and an operations block. In its civil status the first name was
 * typed by hand and the usage name was cleared on purpose (neither is ever proposed); the birth
 * name, birth date and sex are empty. The activity block and the operations block are empty.
 */
export function prefillDraft(): TracfinDraft {
  return personsDraft((draft, persons) => {
    const pp = persons.children![0]!;
    const civil = pp.children!.find((child) => child.id === IDS.civil)!;
    civil.fields = {
      [`${CIVIL}/prenom`]: [{ ...text('v-prenom', 'Jeanne'), origin: manual }],
      [`${CIVIL}/nomDusage`]: [{ id: 'v-usage', kind: 'cleared', origin: { source: 'manual', resolution: 'cleared' } }],
    };
    const activity = findByCatalogId(pp, '/ds/personnes/pp/activite')!;
    activity.id = IDS.activity;
    delete activity.fields;
    draft.document.root.children = [
      ...(draft.document.root.children ?? []),
      { id: IDS.operations, catalog_id: '/ds/operations' },
    ];
  });
}
