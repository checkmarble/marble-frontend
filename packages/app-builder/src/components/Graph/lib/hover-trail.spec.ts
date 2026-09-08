import { describe, expect, it } from 'vitest';
import { buildGraphIndex } from './graph-index';
import { shortestPathUnion } from './hover-trail';

function edge(source: string, target: string, id = `${source}->${target}`) {
  return { id, source, target };
}

describe('shortestPathUnion', () => {
  it('returns only the hovered node when it is the start', () => {
    const trail = shortestPathUnion(buildGraphIndex([edge('start', 'a')]), 'start', 'start');

    expect([...trail.nodeIds]).toEqual(['start']);
    expect([...trail.edgeIds]).toEqual([]);
  });

  it('lights the unique chain from a distant node back to start', () => {
    const trail = shortestPathUnion(
      buildGraphIndex([edge('start', 'a'), edge('a', 'b'), edge('b', 'c')]),
      'start',
      'c',
    );

    expect(trail.nodeIds).toEqual(new Set(['start', 'a', 'b', 'c']));
    expect(trail.edgeIds).toEqual(new Set(['start->a', 'a->b', 'b->c']));
  });

  it('lights every equally short walk, not an arbitrary winner', () => {
    const trail = shortestPathUnion(
      buildGraphIndex([edge('start', 'a'), edge('start', 'b'), edge('a', 'end'), edge('b', 'end')]),
      'start',
      'end',
    );

    expect(trail.nodeIds).toEqual(new Set(['start', 'a', 'b', 'end']));
    expect(trail.edgeIds).toEqual(new Set(['start->a', 'start->b', 'a->end', 'b->end']));
  });

  it('drops a longer detour off the geodesic', () => {
    const trail = shortestPathUnion(
      buildGraphIndex([edge('start', 'a'), edge('a', 'end'), edge('start', 'x'), edge('x', 'y'), edge('y', 'end')]),
      'start',
      'end',
    );

    expect(trail.nodeIds).toEqual(new Set(['start', 'a', 'end']));
    expect(trail.edgeIds).toEqual(new Set(['start->a', 'a->end']));
  });

  it('does not light a same-depth chord between geodesic nodes', () => {
    const trail = shortestPathUnion(
      buildGraphIndex([
        edge('start', 'p'),
        edge('start', 'q'),
        edge('p', 'end'),
        edge('q', 'end'),
        edge('p', 'q', 'p~q'),
      ]),
      'start',
      'end',
    );

    expect(trail.nodeIds).toEqual(new Set(['start', 'p', 'q', 'end']));
    expect(trail.edgeIds.has('p~q')).toBe(false);
    expect(trail.edgeIds).toEqual(new Set(['start->p', 'start->q', 'p->end', 'q->end']));
  });

  it('includes a pivot that sits on the shortest walk', () => {
    const trail = shortestPathUnion(
      buildGraphIndex([edge('start', 'pivot'), edge('pivot', 'person')]),
      'start',
      'person',
    );

    expect(trail.nodeIds).toEqual(new Set(['start', 'pivot', 'person']));
    expect(trail.edgeIds).toEqual(new Set(['start->pivot', 'pivot->person']));
  });

  it('includes every parallel edge on a geodesic hop', () => {
    const trail = shortestPathUnion(
      buildGraphIndex([edge('start', 'end', 'link'), edge('start', 'end', 'match')]),
      'start',
      'end',
    );

    expect(trail.nodeIds).toEqual(new Set(['start', 'end']));
    expect(trail.edgeIds).toEqual(new Set(['link', 'match']));
  });
});
