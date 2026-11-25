# Forms & Modals

TanStack Form with Zod v4, plus `Modal` and `Panel` from `ui-design-system`. Reference form: `components/Settings/Inboxes/InboxPanel.tsx`. Its fields file, `InboxFormFields.tsx`, still casts `defaultValues` with `as` (type them as the payload instead).

---

## TanStack Form

- **Split outer and inner.** The outer component owns `Modal.Root`/`Trigger` (or `Panel.Root`) and the open state. An inner `XContent`, rendered under `Modal.Content` or `Panel.Container`, owns `useForm` and the mutation. Both unmount on close, so the form resets on every open. Render the inner component only once the query behind its defaults has succeeded (`components/Cases/Overview/Panel/SlaConfigPanelContent.tsx`). Give it a `key` when one panel edits different entities (`InboxPanel.tsx`).
- **Schema.** Use the payload schema that the `queries/` mutation file re-exports, which is the same one the server function validates with. Use `.pick()` for subset forms (`InboxFormFields.tsx`), and a local `z.object` only for UI-only shapes.
- **Submit.** `<form onSubmit={handleSubmit(form)}>`, with `handleSubmit` from `@app-builder/utils/form`. It also stops propagation, because React events bubble through the modal portal into a parent `<form>`. `onSubmit` runs only after validation passes, so there's no need for a `formApi.state.isValid` guard. Make `onSubmit` async: `await` the mutation and catch inside it. That way `isSubmitting` covers the request, and nothing rejects unhandled (`handleSubmit` doesn't await `form.handleSubmit()`).
- **After success**, refresh as described in [data-fetching.md](data-fetching.md#refreshing-data).

Field wiring inside the inner component:

```tsx
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { getFieldErrors } from '@app-builder/utils/form';
import { Input } from 'ui-design-system';

<form.Field name="name" validators={{ onChange: formSchema.shape.name }}>
  {(field) => (
    <div className="flex flex-col gap-sm">
      <label htmlFor={field.name}>{t('settings:inboxes.inbox_name')}</label>
      <Input
        id={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.currentTarget.value)}
        onBlur={field.handleBlur}
        aria-invalid={field.state.meta.errors.length > 0 || undefined}
        borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
      />
      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
    </div>
  )}
</form.Field>
```

### Reading form state

`useForm` doesn't subscribe its component to the form, so `form.state` read during render is stale. In render, use `<form.Subscribe selector={(s) => [s.isSubmitting, s.canSubmit] as const}>` (`InboxPanel.tsx`) or `useSelector(form.store, (s) => s.values.x)` from `@tanstack/react-form` (never the deprecated `useStore` alias). Read `form.state` only in handlers.

### Form components (`components/Form/Tanstack/`)

- Use design-system `Input` and `TextArea` directly (wired with `id={field.name}`, `aria-invalid`, and `borderColor`), paired with native `<label htmlFor={field.name}>` (conditional `text-red-primary` on error). Always pass `TextArea` a translated `placeholder` (its default is an untranslated "Write a note").
- `FormErrorOrDescription` shows the first of `errors`, otherwise `description`.

### Number fields

`NumberInput` (`ui-design-system`) binds directly: `onChange={field.handleChange}` receives a number, and `value` must be a number. It accepts integers only unless you pass `decimalPrecision={n}`. Clearing it does not call `onChange`, so the field keeps its last number while the input shows empty. (With a plain `Input type="number"` and `+e.currentTarget.value`, an empty input becomes `0`.) Give it `id={field.name}` under a `<label htmlFor={field.name}>`.

---

## Modal

- `Modal.Content` unmounts when closed. Always render a `Modal.Title`: Radix warns without one. `Modal.FooterButton isCloseButton` closes the modal through `Dialog.Close`, so it needs no `onClick`.
- `Button` defaults to `type="button"`, so the submit `FooterButton` needs `type="submit"`. When the footer sits outside the `<form>`, add `form={formId}`.
- **Destructive confirm**: `<Modal.FooterButton variant="destructive" leadingIcon="delete" ... />`, not `color="red"`, which only applies to `variant="primary"` with the filled appearance. Footer markup reference: `components/Settings/Inboxes/DeleteInboxUser.tsx` (its trigger is `DeleteInboxUserButton` in `InboxMembers.tsx`).

---

## Panel (slide-out)

A custom sharpstate component, not Radix. Reference: `components/Settings/Inboxes/InboxPanel.tsx` (form `id` from `useId`, `Panel.Footer` under `Panel.Content`, `router.invalidate()`).

- `Panel.Root` always renders its children; only `Panel.Container` returns `null` when closed. Keep `useForm` in a component rendered inside `Panel.Container`, otherwise the form state survives a close.
- Close from inside with `PanelSharpFactory.useSharp().actions.close()`. `PanelSharpFactory` is exported from `ui-design-system`.
- Escape, the header ✕ and `isCloseButton` all call `onOpenChange(false)`. A controlled panel stays open until the parent flips `open`, so the parent can confirm unsaved changes first. An uncontrolled panel (`Panel.Trigger`) closes unless `onOpenChange` returns `false`.
- `Panel.Footer` must stay a direct child of `Panel.Content`, because of its sticky `mt-auto` layout. Either give the `<form>` an `id` and use `<Panel.FooterButton type="submit" form={formId} />`, or wrap `Panel.Content` in `<form className="contents">`.
