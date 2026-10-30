import type { ComponentType } from 'react';
import type { TracfinSectionId } from '../model/sections';
import { ContextSection } from './ContextSection';
import { DeclarationSection } from './DeclarationSection';
import { OperationsSection } from './OperationsSection';
import { PersonsSection } from './PersonsSection';
import { PiecesSection } from './PiecesSection';
import { ReviewSection } from './ReviewSection';

/**
 * The section slots of the draft page. A section is a component without props: it reads the draft
 * and the editor with `useTracfinDraftEditorContext()`. Tasks 4 to 8 replace the placeholder
 * component of their section (each in its own file); nothing else changes in the shell.
 */
export const tracfinSectionComponents: Record<TracfinSectionId, ComponentType> = {
  declaration: DeclarationSection,
  context: ContextSection,
  persons: PersonsSection,
  operations: OperationsSection,
  pieces: PiecesSection,
  review: ReviewSection,
};
