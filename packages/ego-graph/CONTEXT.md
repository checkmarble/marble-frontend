# Context: ego-graph

The vocabulary of this package. Glossary only — no implementation, no decisions.
For decisions see [docs/adr](./docs/adr).

## Terms

**Ego graph** — a graph seen from one node. Not a general graph: every layout
here answers "what surrounds *this* node", and every distance is measured from it.

**Root** — the node the layout centres on. The ego. Its centre is the origin of
the coordinate system the layout returns.

**Structural edge** — an edge that defines the hierarchy the layout draws. The
spanning tree is built from these and nothing else.

**Associative edge** — an edge that exists and is rendered, but must never
influence position. Two nodes can be associated without one being under the
other. An associative edge between two ordinary nodes is legal and common.

The distinction is *not* importance. An associative edge may be the most
significant relationship in the domain; it is simply not hierarchical.

**Satellite** — a node that never joins the spanning tree, whatever edges it
has. A role, not a consequence: declaring a node a satellite settles its
placement regardless of edge classes. Satellites are parked on the periphery so
they cannot reparent branches or warp the ring.

Satellite and edge class are **orthogonal axes**. A satellite may have structural
edges (it still stays out of the tree); an ordinary node may have only
associative ones (it still is not a satellite).

**Spanning tree** — the one hierarchy every pass agrees on: structural edges
between non-satellite nodes, breadth-first from the root. There is exactly one
definition, shared by layout and folding.

**Ring** — the circle of level-1 branches around the root.

**Slot** — one angular position on a ring. **Sector** — a wedge of the circle
allotted to a group of children.

**Pocket** — the angular region allotted to one satellite and the island hanging
off it, on an arc outside everything the tree placed.

**Island** — a connected group of nodes the spanning tree could not reach,
claimed by a satellite (or, if no satellite touches it, standing alone as an
**orphan** island). Every island gets a pocket.

**Lateral half-extent** — half the width of a laid-out subtree, measured
perpendicular to the ray it grows along. The packing measure: two neighbouring
branches clear each other when the ring is wide enough for both half-extents
plus padding.

**Fold** — a branch collapsed behind a single stand-in. **Folded group** — the
nodes that disappeared. A fold names the branch by its **root**; the fold's
members include that root.

**Fold plan** — what to collapse and what to redraw, with no opinion about how.
The package emits a plan; the caller materialises whatever a collapsed branch
should look like.

## Words this package does not use

`pivot`, `connector`, `person`, `company`, `match edge`, `link edge`, `cluster`,
`chip`, `start`. They come from the domain this code was extracted from and mean
nothing to anyone else.
