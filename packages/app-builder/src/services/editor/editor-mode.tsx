import { createSimpleContext } from '@app-builder/utils/create-context';

export type EditorMode = 'edit' | 'view';

const EditorModeContext = createSimpleContext<EditorMode>('EditorModeContext');

export const EditorModeContextProvider = EditorModeContext.Provider;

export const useEditorMode = EditorModeContext.useValue;
