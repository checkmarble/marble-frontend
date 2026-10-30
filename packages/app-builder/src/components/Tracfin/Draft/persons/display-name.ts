import type { TracfinBlock } from '@app-builder/models/tracfin';
import { childrenOfCatalogId } from '../model/block-address';
import { firstText } from './document';
import { type PersonKind, personCatalogId } from './person-kinds';

const MAX_NAME_LENGTH = 60;

const shorten = (text: string) => (text.length > MAX_NAME_LENGTH ? `${text.slice(0, MAX_NAME_LENGTH - 1)}…` : text);

/**
 * The name a declared person goes by, computed from its own saved fields; `null` when it has none
 * yet (the screen then says « Personne sans nom »).
 * - natural person: first name and birth name (or the name of use) of the civil status
 * - legal entity: the company name, else its trade name
 * - non-customer person: the identification elements, else the involvement
 */
export function personDisplayName(person: TracfinBlock, kind: PersonKind): string | null {
  const base = personCatalogId(kind);
  switch (kind) {
    case 'pp': {
      const civil = childrenOfCatalogId(person, `${base}/etatCivil`)[0];
      const surname =
        firstText(civil, `${base}/etatCivil/nomNaissance`) ?? firstText(civil, `${base}/etatCivil/nomDusage`);
      const name = [firstText(civil, `${base}/etatCivil/prenom`), surname].filter(Boolean).join(' ');
      return name === '' ? null : shorten(name);
    }
    case 'pm': {
      const activity = childrenOfCatalogId(person, `${base}/activiteCoordonnee`)[0];
      const name =
        firstText(activity, `${base}/activiteCoordonnee/denominationSociale`) ??
        firstText(activity, `${base}/activiteCoordonnee/enseigneSigle`);
      return name === null ? null : shorten(name);
    }
    case 'pnc': {
      const name = firstText(person, `${base}/elementsIdentification`) ?? firstText(person, `${base}/implication`);
      return name === null ? null : shorten(name);
    }
  }
}
