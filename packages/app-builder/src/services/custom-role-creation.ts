type Sections = Record<string, boolean>;

type RoleInput = { name: string; slug: string; permissions: string[]; sections: Sections };

type SavedRole = { permissions: string[]; sections: Sections };

function samePermissions(a: string[], b: string[]) {
  const set = new Set(a);
  return set.size === new Set(b).size && b.every((permission) => set.has(permission));
}

// The backend treats a section missing from the map as visible.
function sameSections(a: Sections, b: Sections) {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].every((key) => (a[key] ?? true) === (b[key] ?? true));
}

/**
 * `saved` is the role as the backend last returned it: only what differs from it is sent.
 * Without it (a new role, or a retry after creation), the backend state is unknown, so every update is sent
 * except the defaults of a new role (no permissions, every section visible).
 */
export async function saveCustomRole(
  input: RoleInput,
  alreadyCreated: boolean,
  api: {
    create: (role: { name: string; slug: string }) => Promise<{ success: boolean }>;
    updatePermissions: (data: { role: string; permissions: string[] }) => Promise<void>;
    updateSections: (data: { role: string; sections: Sections }) => Promise<void>;
  },
  saved?: SavedRole,
): Promise<'success' | 'duplicate' | 'access_failed'> {
  if (!alreadyCreated) {
    const result = await api.create({ name: input.name, slug: input.slug });
    if (!result.success) return 'duplicate';
  }

  const baseline: SavedRole | undefined = saved ?? (alreadyCreated ? undefined : { permissions: [], sections: {} });
  const updates: Promise<void>[] = [];
  if (!baseline || !samePermissions(baseline.permissions, input.permissions)) {
    updates.push(api.updatePermissions({ role: input.slug, permissions: input.permissions }));
  }
  if (!baseline || !sameSections(baseline.sections, input.sections)) {
    updates.push(api.updateSections({ role: input.slug, sections: input.sections }));
  }

  const results = await Promise.allSettled(updates);
  return results.some((result) => result.status === 'rejected') ? 'access_failed' : 'success';
}
