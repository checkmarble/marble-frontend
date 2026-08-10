# ego-graph

[![npm version](https://img.shields.io/npm/v/ego-graph.svg)](https://www.npmjs.com/package/ego-graph)
[![CI](https://github.com/checkmarble/marble-frontend/actions/workflows/ego-graph.yml/badge.svg)](https://github.com/checkmarble/marble-frontend/actions/workflows/ego-graph.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Radial layouts for **ego graphs** — a graph seen from one node — with optional
branch folding. Built for [React Flow](https://reactflow.dev), but the core
knows nothing about it.

Most layout libraries draw hierarchies (`dagre`, `elkjs`) or let physics decide
(`d3-force`). Neither is what you want when there is one node the whole picture
is *about*: a customer and their connections, a person and their network, an
account and everything touching it. That is an ego graph, and it wants the root
in the middle with its neighbourhood arranged around it.

## Install

```sh
npm install ego-graph
```

Zero dependencies. `@dagrejs/dagre` is an **optional** peer — install it only if
you use `radialDagre` or `sectoredDagre`:

```sh
npm install ego-graph @dagrejs/dagre
```

## Quick start

```ts
import { radialDagre } from 'ego-graph';
import { applyPositions, retargetHandles, toLayoutGraph } from 'ego-graph/react-flow';

const graph = toLayoutGraph(nodes, edges, 'customer-42');
const positions = radialDagre(graph);

const laidOut = applyPositions(nodes, positions);
const rewired = retargetHandles(laidOut, edges);
```

The core takes `{ id, width, height }` nodes and `{ source, target }` edges and
returns `Map<id, { x, y }>` of **top-left** positions. It is synchronous, has no
dependencies, and does not import React. The `react-flow` adapter is four pure
functions and does not import React either.

## The three layouts

All three centre the root at the origin and place unreachable nodes in pockets
on an outer arc. They differ only in how a branch is drawn.

| | | dependency |
|---|---|---|
| `radialDagre` | A ring of level-1 branches, each drawn by Dagre pointing outward. The workhorse — deep, uneven branches stay legible. | `@dagrejs/dagre` |
| `sectoredDagre` | Every node lays out its own children, splitting them across sectors once there are more than five. Balances better on wide, shallow graphs. | `@dagrejs/dagre` |
| `polarPetal` | Pure polar placement all the way down: each node spreads its children over a hemisphere centred on the ray it arrived along. | **none** |

`@dagrejs/dagre` is an **optional peer dependency**. It is reachable from
exactly one module, so importing only `polarPetal` leaves it out of your bundle
entirely — 8 kB minified against 49 kB.

## Classifying your graph

Two optional predicates, and they are **orthogonal axes**:

```ts
radialDagre(graph, {
  // Does this edge define hierarchy? Default: every edge does.
  isStructural: (edge) => edge.type !== 'same-ip',
  // Keep this node out of the tree and park it on the periphery. Default: none.
  isSatellite: (node) => node.type === 'shared-attribute',
  // How many nodes does this one stand for? Default: 1.
  getWeight: (node) => node.data.memberCount ?? 1,
});
```

An **associative** edge (one where `isStructural` is false) is still rendered —
it simply never influences position. This is not the same as being unimportant;
it may be the most interesting relationship you have. It is just not
hierarchical.

A **satellite** never joins the tree no matter what edges it has. That is the
point: an attribute shared by six otherwise-unrelated people would, if allowed
into the hierarchy, drag all six under it and wreck the star. Instead it gets a
pocket on the outer arc, with its own island laid out locally.

See [CONTEXT.md](./CONTEXT.md) for the full vocabulary.

## Folding

For graphs too large to show at once, collapse whole branches:

```ts
import { foldGraph } from 'ego-graph/fold';

const plan = foldGraph(graph, { threshold: 10, isSatellite, isStructural });
// { folds: [{ rootId, memberIds, internalEdgeCount }],
//   mergedEdges: [{ source, target, mergedFrom, allAssociative }],
//   heldOpen: string[], foldOf: Map<memberId, rootId> }
```

`foldGraph` returns a **plan**, never nodes. It says *what* collapses; you decide
what a collapsed branch looks like — its id, its size, its label, its payload.
The shallowest branch exceeding `threshold` folds, so expanding one re-applies
the rule to its children and folds nest. Pass `expandedRoots` to hold specific
branches open; they come back in `heldOpen` so you can offer a regroup control.

## Layout runs before React Flow measures

This bites everyone once. React Flow does not know how big a node is until it
has rendered it, so the first layout pass runs on estimates. You need two:

```tsx
function AutoLayout({ nodes, edges, root }) {
  const { setNodes, setEdges } = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  useEffect(() => {
    if (!nodesInitialized) return;
    const positions = radialDagre(toLayoutGraph(nodes, edges, root));
    const laidOut = applyPositions(nodes, positions);
    setNodes(laidOut);
    setEdges(retargetHandles(laidOut, edges));
  }, [nodesInitialized]);

  return null;
}
```

Render it as a child of `<ReactFlow>`. Until then, `toLayoutGraph` falls back to
180×56 per node; pass a fourth argument to change that.

## Edge handles

`retargetHandles` re-points every edge at whichever handle faces its counterpart,
which is what stops edges from crossing their own nodes after a radial layout.
For that to work your node must actually **render the handles it names**. Eight
of them, invisible:

```tsx
import { Handle, Position } from '@xyflow/react';

function OmniHandles() {
  const style = { opacity: 0, border: 0 };
  return (
    <>
      <Handle type="target" position={Position.Top} id="t" style={style} />
      <Handle type="target" position={Position.Right} id="r" style={style} />
      <Handle type="target" position={Position.Bottom} id="b" style={style} />
      <Handle type="target" position={Position.Left} id="l" style={style} />
      <Handle type="source" position={Position.Top} id="st" style={style} />
      <Handle type="source" position={Position.Right} id="sr" style={style} />
      <Handle type="source" position={Position.Bottom} id="sb" style={style} />
      <Handle type="source" position={Position.Left} id="sl" style={style} />
    </>
  );
}
```

Bare sides for targets, `s`-prefixed for sources. If your nodes name handles
differently, pass a mapper: `retargetHandles(nodes, edges, (side, kind) => ...)`.

## Spacing

Six dials, all optional. Defaults are tuned for roughly 180×56 nodes — if yours
are much bigger, scale them up, because nothing here derives spacing from the
nodes it is spacing.

| option | default | |
|---|---|---|
| `nodeSep` | `80` | gap between siblings inside a Dagre sub-layout |
| `rankSep` | `100` | gap between ranks inside a Dagre sub-layout |
| `minRingRadius` | `220` | floor on the first ring, so level-1 clears the root |
| `ringPadding` | `60` | extra space between adjacent branches |
| `satelliteGap` | `π/3` | satellites within this angle of each other get fanned |
| `minSatelliteGap` | `π/12` | floor on the gap between fanned satellites |

Exported as `DEFAULT_SPACING`.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md). Short version: **open an issue
first** — we triage there and invite collaborators when we want a change.
Unsolicited PRs may be closed. See also the [Code of Conduct](./CODE_OF_CONDUCT.md)
and [security policy](./SECURITY.md).

## Licence

MIT
