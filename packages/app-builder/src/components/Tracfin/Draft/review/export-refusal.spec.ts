import { describe, expect, it } from 'vitest';
import { parseExportRefusal } from './export-refusal';

// Backend `Export`: errors.Wrap(UnprocessableEntityError, XMLFieldError.Error()) ->
// "XML export <field> block <block> value <value>: <reason>: unprocessable entity"
const BLOCK = 'd6506c9b-94ef-5e7e-b9cd-7311e6587dcb';
const VALUE = '8e1d5b3a-0c11-4d7e-9a3b-6f0f2b6d7a10';

describe('parseExportRefusal', () => {
  it('reads the field, the block, the value and the code point of a forbidden character', () => {
    const message = `XML export /ds/personnes/pp/etatCivil/prenom block ${BLOCK} value ${VALUE}: Forbidden XML character U+0001: unprocessable entity`;
    expect(parseExportRefusal(message)).toEqual({
      fieldId: '/ds/personnes/pp/etatCivil/prenom',
      blockId: BLOCK,
      valueId: VALUE,
      reason: 'forbidden_character',
      codePoint: 'U+0001',
      detail: 'Forbidden XML character U+0001',
    });
  });

  it('keeps five and six hex digits, and upper-cases them', () => {
    const message = `XML export /ds/analyse block ${BLOCK} value ${VALUE}: Forbidden XML character U+10ffff: unprocessable entity`;
    expect(parseExportRefusal(message)?.codePoint).toBe('U+10FFFF');
  });

  it('tolerates a value without id (the backend prints an empty one) and a message without the sentinel suffix', () => {
    const parsed = parseExportRefusal(`XML export /ds/analyse block ${BLOCK} value : Forbidden XML character U+000B`);
    expect(parsed).toMatchObject({ fieldId: '/ds/analyse', blockId: BLOCK, valueId: null, codePoint: 'U+000B' });
  });

  it('tolerates a wrapper before the message', () => {
    const parsed = parseExportRefusal(
      `request failed: XML export /ds/analyse block ${BLOCK} value ${VALUE}: Forbidden XML character U+0000: unprocessable entity`,
    );
    expect(parsed).toMatchObject({ fieldId: '/ds/analyse', valueId: VALUE, codePoint: 'U+0000' });
  });

  it('names the other two reasons of the backend', () => {
    const utf8 = parseExportRefusal(
      `XML export /ds/analyse block ${BLOCK} value ${VALUE}: Invalid UTF-8: unprocessable entity`,
    );
    expect(utf8).toMatchObject({ reason: 'invalid_utf8', codePoint: null });
    const attribute = parseExportRefusal(
      `XML export /ds/organisme/adresse/pays/@type block ${BLOCK} value ${VALUE}: Duplicate XML attribute on one occurrence: unprocessable entity`,
    );
    expect(attribute).toMatchObject({ reason: 'duplicate_attribute', fieldId: '/ds/organisme/adresse/pays/@type' });
  });

  it('returns null for a 422 that is not an XML refusal, so the screen can fall back to the raw message', () => {
    expect(parseExportRefusal('TRACFIN forward link is not unique: unprocessable entity')).toBeNull();
    expect(parseExportRefusal('')).toBeNull();
    expect(parseExportRefusal(null)).toBeNull();
    // A message that names no block cannot be linked to anything.
    expect(parseExportRefusal('XML export  block  value : whatever')).toBeNull();
  });
});
