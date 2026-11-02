type RoleInput = { name: string; slug: string; permissions: string[] };

export async function saveCustomRole(
  input: RoleInput,
  alreadyCreated: boolean,
  api: {
    create: (role: { name: string; slug: string }) => Promise<{ success: boolean }>;
    updatePermissions: (data: { role: string; permissions: string[] }) => Promise<void>;
  },
): Promise<'success' | 'duplicate' | 'permissions_failed'> {
  if (!alreadyCreated) {
    const result = await api.create({ name: input.name, slug: input.slug });
    if (!result.success) return 'duplicate';
  }

  if (alreadyCreated || input.permissions.length > 0) {
    try {
      await api.updatePermissions({ role: input.slug, permissions: input.permissions });
    } catch {
      return 'permissions_failed';
    }
  }
  return 'success';
}
