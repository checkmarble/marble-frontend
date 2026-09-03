import { type ReactNode } from 'react';
import { GraphAnnotationsProvider } from './GraphAnnotationsContext';
import { GraphFocusProvider, type SelectedGraphObject } from './GraphFocusContext';
import { GraphInteractionProvider } from './GraphInteractionContext';
import { GraphStatsProvider } from './GraphStatsContext';
import { GraphStructureProvider } from './GraphStructureContext';
import { type ControlledGraphSettings, GraphViewSettingsProvider } from './GraphViewSettingsContext';

/**
 * Every piece of graph state a canvas and its panels share.
 *
 * Deliberately several providers rather than one: each slice changes on its own
 * schedule — hover on every mouse move, filters on a click, stats as a
 * consequence of both — and a component that reads one is not re-rendered by
 * the others. See the individual context modules for what each owns.
 */
export function CustomerGraphProvider({
  children,
  initialSelectedObject = null,
  ...settings
}: Partial<ControlledGraphSettings> & {
  children: ReactNode;
  initialSelectedObject?: SelectedGraphObject | null;
}) {
  return (
    <GraphInteractionProvider>
      <GraphViewSettingsProvider {...settings}>
        <GraphStructureProvider>
          <GraphFocusProvider initialSelectedObject={initialSelectedObject}>
            <GraphAnnotationsProvider>
              <GraphStatsProvider>{children}</GraphStatsProvider>
            </GraphAnnotationsProvider>
          </GraphFocusProvider>
        </GraphStructureProvider>
      </GraphViewSettingsProvider>
    </GraphInteractionProvider>
  );
}
