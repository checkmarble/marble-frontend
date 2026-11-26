# Marble

Marble lets compliance teams detect risky activity with scenarios and screenings, then investigate the alerts in cases.

## Screening review

**Hit**:
A screening match awaiting or having received a reviewer's decision: Hit (confirmed hit) or No hit.
_Avoid_: Item, alert (for a single match)

**Tentative review**:
A reviewer's non-binding Hit or No hit on a pending hit, always carried by a comment. The hit stays pending until another reviewer confirms it, and the case is escalated for that confirmation. A hit has at most one active tentative review; a newer one replaces it.
_Avoid_: Comment review, annotation, draft decision

**Validation**:
A planned role-based step where every decision from a non-validator awaits a validator. Distinct from a tentative review, which is a reviewer's own choice on one hit.
_Avoid_: Tentative review (for this meaning)

## Case workflow

**Escalation**:
Moving a case, unassigned, into the escalation inbox of its current inbox.
_Avoid_: Transfer, reassignment

**Escalation inbox**:
The inbox an inbox's cases go to when escalated. An inbox without one cannot escalate.
