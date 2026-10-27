import type {
  TracfinCatalog,
  TracfinConfiguration,
  TracfinDraft,
  TracfinExport,
  TracfinPrefillResult,
  TracfinValidation,
} from '../index';
import { catalogProfileFixture } from './catalog.fixture';
import configurationJson from './configuration.fixture.json';
import draftJson from './draft.fixture.json';
import exportJson from './export.fixture.json';
import prefillJson from './prefill.fixture.json';
import validationJson from './validation.fixture.json';

/**
 * Typed views over the JSON fixtures of this folder, which are written in the exact wire shape of
 * the backend (snake_case, server IDs, `null` for an empty Go slice). Fixtures share their IDs:
 * the draft embeds the configuration, and the prefill result and the validation address blocks of
 * the draft.
 */

/** The real transport limits served with the catalog (`handle_tracfin.go`). */
export const tracfinCatalogFixture: TracfinCatalog = {
  profile: catalogProfileFixture,
  limits: {
    request_bytes: 1_048_576,
    navigation_default: 25,
    navigation_max: 100,
    attachment_bytes: 67_108_864,
    xml_bytes: 100_663_296,
  },
};

/**
 * Revision 3. Two Company links from `users` (`employer` and `affiliated_company` both lead to
 * `companies`), a `users` -> `accounts` -> `cards` path, and two mappings that target the same field.
 */
export const tracfinConfigurationFixture = configurationJson as TracfinConfiguration;

/** Revision 3, without a last export: organisme, declarant, context and one person with selections. */
export const tracfinDraftFixture = draftJson as TracfinDraft;

/** One resolved proposal, one conflict proposal with two candidates, and two diagnostics. */
export const tracfinPrefillFixture = prefillJson as TracfinPrefillResult;

/** `official_xsd` is unavailable, as it always is. */
export const tracfinValidationFixture = validationJson as TracfinValidation;

/** The export of draft revision 3, whose validation carries `"diagnostics": null`. */
export const tracfinExportFixture = exportJson as TracfinExport;
