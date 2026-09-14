Last Updated: 2026-09-14

Current state: API field adaptation leaves semantics optional; the editor infers from names and detects unsaved inference against model fields.
Proposed state: adapted fields have a generic semantic type based only on data type, except booleans whose semantics remain absent. Missing subtypes stay absent; existing declarations stay intact.
Phases: share primitive defaults; normalize fields with fallback provenance; preserve editor inference and supervised saves; verify with focused regressions and app-builder type-check.
Risk: normalized fields can hide absent backend declarations. Retain serializable provenance and consult it in editor adaptation and change detection.
Success: reads never infer names or write values; supervised editor saves continue to persist inferred semantics.

Correction: Bool and Bool[] have no read-time semantic fallback because their display follows the data type. Preserve supervised form defaults and existing saved declarations.
