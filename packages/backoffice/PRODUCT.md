# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Checkmarble internal staff only — the team that onboards new customers and
operates the Marble platform (onboarding / customer success / support /
engineering). The primary situation is provisioning a new customer
**organization** and then managing it over its lifetime. This surface is never
exposed to customers or to self-hosting super-admins; it is an internal
operator console.

## Product Purpose

The backoffice is the internal control plane for Marble, Checkmarble's fraud /
AML transaction-monitoring and decisioning platform. It lets Checkmarble
operators create and administer the customer organizations that run on Marble:
standing up a new org, seeding its data model, managing its users and roles,
toggling gated features, and (planned) managing licences and an operational
overview. Success is an operator completing a provisioning or administration
task quickly and correctly, without touching a database or asking an engineer.

## Positioning

Not a market-facing product — its value is operational leverage for the
Checkmarble team. The distinctive mechanism is **spec-driven organization
provisioning**: an operator can stand up a fully configured org from a single
JSON import spec that declares org settings (timezone, sanctions threshold /
limit), admin users, the full data model (tables, fields, links), and optional
seeding (ingestion row counts and generated decisions) — or start from a
template, or create an empty org by name. This turns customer onboarding from a
manual, multi-system setup into a reviewable, repeatable artifact.

## Operating Context

- Operators work against a running Marble backend via the backoffice API
  (`marble-api` backoffice client) with token-based auth; deployments may use an
  OIDC provider.
- Core workflows today:
  - **Organizations** — list all orgs (name, ID) and drill into one.
  - **Create organization** — three flows: upload/drag a JSON import spec,
    pick a template, or create an empty org with just a name. The import flow
    shows a full review (settings, admins, data model tabs per table with
    fields and links, seeding recap) before the operator confirms.
  - **Organization users** — list users and add a user (first/last name,
    email, role). Available roles depend on the org's `roles` feature access.
  - **Organization features** — set overridable feature access to
    `restricted` / `test` / `allowed` and save.
- Data these operators reason about: organizations, users, roles, feature
  access, data-model tables/fields/links, ingestion seeds, and decisions.

## Capabilities and Constraints

- **User roles** (assigned within a customer org): `ADMIN`, `PUBLISHER`,
  `BUILDER`, `VIEWER`, `ANALYST`. When the org's `roles` feature is
  `restricted`, only `ADMIN` is assignable.
- **Overridable features** (per org, value `restricted` / `test` / `allowed`):
  `test_run`, `sanctions`, `case_auto_assign`, `case_ai_assist`,
  `continuous_screening`.
- **Import spec** carries org settings (name, default scenario timezone,
  sanctions threshold, sanctions limit), admins, a data model (tables → fields
  with type/description, and inter-table links), and optional seeds (per-table
  ingestion counts, per-trigger decision counts). Max import file size 20 MB,
  JSON only.
- Built on the shared Marble frontend monorepo: TanStack Start (SSR),
  TanStack Router (file-based routing), TanStack Query / Form, tRPC, Firebase
  auth, Zod validation, `marble-api`, `ui-design-system`, `ui-icons`, Sentry.
- **In scope now, not yet built** (treat as committed product surfaces to
  design, not scaffolding to ignore):
  - **Dashboard** — the operator's landing surface; currently renders nothing
    and needs a real operational overview.
  - **Licences** — a genuine feature (licence management); currently a
    placeholder.
  - **Organization settings** — org-level settings surface; route exists,
    content undecided.
  - **Templates** — the "create from template" path is stubbed (Template 1/2/3);
    real templates and their selection UX are undecided.

## Brand Commitments

- Identity is Marble / Checkmarble. This surface uses the shared Marble design
  system (`ui-design-system` components, `ui-icons`, and the shared Tailwind
  token vocabulary — e.g. `surface-card`, `grey-border`, `text-h1`, spacing
  `gap-md`) as its base and stays recognizably part of Marble.
- **Latitude:** as an internal operator tool it may diverge from the customer
  app where that serves operators — e.g. higher density, faster task paths, and
  admin-specific affordances — provided it builds on the shared system rather
  than inventing a parallel one.

## Evidence on Hand

- Real, working surfaces in code: Organizations list, org detail with Users and
  Features tabs, the Create-Organization panel (import / template / empty), and
  the import review flow. These are the ground truth for behavior and data
  shapes.
- No marketing content, testimonials, customers, benchmarks, pricing, or
  licensing terms exist in this package — future work must not fabricate them.
  Templates (Template 1/2/3) are placeholders, not real templates.

## Product Principles

1. **Operator speed over polish theater.** These are internal power users doing
   repetitive, high-stakes provisioning; optimize for scannability, few clicks,
   and confident confirmation, not decoration.
2. **Show the whole artifact before committing.** Destructive or provisioning
   actions (import, seeding) get a complete, reviewable recap first — the
   operator should never guess what a click will create.
3. **Correctness is the product.** Roles, feature gates, and data-model shapes
   are enforced by real schemas; the UI must make the valid path obvious and the
   invalid path hard.
4. **One family with the customer app.** Reuse the shared design system so the
   backoffice reads as Marble, diverging only where operator ergonomics demand
   it.

## Accessibility & Inclusion

No product-specific accessibility standard was established beyond honoring the
shared design system's accessible primitives (keyboard-navigable menus,
dialogs, and form controls from `ui-design-system`).
