import { describe, expect, it, vi } from 'vitest';
import { createGraphInteractionStore } from '../contexts/graph-interaction-store';
import { EMPTY_HOVER_TRAIL, type HoverTrail } from './hover-trail';

function trail(nodeIds: string[], edgeIds: string[] = []): HoverTrail {
  return { nodeIds: new Set(nodeIds), edgeIds: new Set(edgeIds) };
}

describe('createGraphInteractionStore', () => {
  it('notifies subscribers when state changes', () => {
    const store = createGraphInteractionStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.actions.hoverNode('a');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState().hoveredNodeId).toBe('a');
  });

  it('stops notifying after unsubscribe', () => {
    const store = createGraphInteractionStore();
    const listener = vi.fn();
    store.subscribe(listener)();

    store.actions.hoverNode('a');

    expect(listener).not.toHaveBeenCalled();
  });

  it('stays silent when an action changes nothing', () => {
    const store = createGraphInteractionStore();
    store.actions.hoverNode('a');
    const listener = vi.fn();
    store.subscribe(listener);

    store.actions.hoverNode('a');
    store.actions.hoverEdge(null);
    store.actions.clearCheckedNodes();

    expect(listener).not.toHaveBeenCalled();
  });

  it('carries the trail alongside the hovered node', () => {
    const store = createGraphInteractionStore();

    store.actions.hoverNode('a', trail(['start', 'a'], ['start->a']));

    expect(store.getState().hoverTrail.nodeIds).toEqual(new Set(['start', 'a']));
  });

  it('clears the trail when hover is dropped', () => {
    const store = createGraphInteractionStore();
    store.actions.hoverNode('a', trail(['start', 'a']));

    store.actions.hoverNode(null);

    expect(store.getState().hoveredNodeId).toBeNull();
    expect(store.getState().hoverTrail).toBe(EMPTY_HOVER_TRAIL);
  });

  it('drops the hover on entering selection mode', () => {
    const store = createGraphInteractionStore();
    store.actions.hoverNode('a', trail(['start', 'a']));

    store.actions.enterSelectionMode();

    expect(store.getState()).toMatchObject({
      selectionMode: true,
      hoveredNodeId: null,
      hoverTrail: EMPTY_HOVER_TRAIL,
    });
  });

  it('discards the checked set on leaving selection mode', () => {
    const store = createGraphInteractionStore();
    store.actions.enterSelectionMode();
    store.actions.toggleCheckedNode('a');

    store.actions.exitSelectionMode();

    expect(store.getState().selectionMode).toBe(false);
    expect(store.getState().checkedNodeIds.size).toBe(0);
  });

  it('toggles a node in and back out of the checked set', () => {
    const store = createGraphInteractionStore();

    store.actions.toggleCheckedNode('a');
    store.actions.toggleCheckedNode('b');
    store.actions.toggleCheckedNode('a');

    expect(store.getState().checkedNodeIds).toEqual(new Set(['b']));
  });

  it('replaces the checked set rather than mutating it, so snapshots compare by identity', () => {
    const store = createGraphInteractionStore();
    const before = store.getState().checkedNodeIds;

    store.actions.toggleCheckedNode('a');

    expect(store.getState().checkedNodeIds).not.toBe(before);
    expect(before.size).toBe(0);
  });

  it('gives each store its own state', () => {
    const one = createGraphInteractionStore();
    const two = createGraphInteractionStore();

    one.actions.toggleCheckedNode('a');

    expect(two.getState().checkedNodeIds.size).toBe(0);
  });
});
