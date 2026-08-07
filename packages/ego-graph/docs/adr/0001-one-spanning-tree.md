# 1. One spanning tree, shared by layout and folding

Date: 2026-08-07

## Status

Accepted.

## Context

This code was extracted from an application that built **two different spanning
trees from the same graph**, and used them for two different passes:

- **Folding** walked *every* edge, satellites included. A group of nodes
  reachable only through a satellite was therefore a branch, and could collapse
  into a single stand-in.
- **Layout** walked structural edges between non-satellite nodes only. This was
  deliberate: satellites are cross-cutting, and letting them into the tree turns
  a tidy star into a set of deep, lopsided branches.

Two functions over one graph disagreeing about what a branch is, is not
something you can put in a README.

Worse, the folding tree was **order-dependent**. A satellite discovered at
breadth-first depth *d* makes all its neighbours depth *d+1*, stealing them from
deeper structural parents. In our own fixture, swapping the position of two
edges in the input array moved three nodes from one branch to another and
changed a branch's weight from 3 to 1 — different folds, same graph.

## Decision

There is one spanning tree: **structural edges between non-satellite nodes,
breadth-first from the root**. Both folding and layout consume it.

Satellites are excluded when the tree is built, not filtered out afterwards.

## Consequences

**A group reachable only through a satellite is no longer a branch, and will not
fold.** It stays on canvas, and the layout gives it a pocket. This is a real
capability loss and the reason this decision is worth recording — someone will
eventually ask why a visibly cohesive cluster refuses to collapse.

We measured the loss before accepting it. Across every hand-written fixture in
the originating application, at all eight threshold settings the UI offered, the
output is **byte-identical**. The difference only appears on generated graphs
large and dense enough for satellite-owned islands to exceed the fold threshold.

**Fold boundaries are now independent of input edge order.** This is a bug fix
we got for free, and on balance is worth more than the capability lost.

**Two blocks of the folding code became dead** and were deleted: the filter
removing satellites from a fold's members, and the guard for a fold with no
members. Both existed only to compensate for satellites being in the tree.

**One test was rewritten rather than repaired.** It asserted that an island
owned by a satellite collapses into a chip — precisely the behaviour being
removed. It now asserts the opposite: the island stays unfolded and on canvas.

## Alternatives considered

**Keep both trees and document the difference.** Zero behaviour change, all
existing tests stay green. Rejected: it makes the package's central concept
conditional on which function you call, and preserves the order-dependence bug.

**Let the caller supply the tree.** Most flexible, and makes the tree a
first-class inspectable value. Rejected for v1 as it adds a step to every
example for a generality nobody has asked for. `buildSpanningTree` is exported,
so this stays available later without a breaking change.
