import type { CredentialsDto } from 'marble-api/generated/marblecore-api';

type Credentials = Pick<CredentialsDto['credentials'], 'role' | 'roles'>;

// Backends with multi-role bindings return `roles`; older ones only return `role`.
export const getCredentialsRoles = (credentials: Credentials): string[] =>
  credentials.roles ?? (credentials.role ? [credentials.role] : []);

export const isMarbleAdmin = (credentials: Credentials) => getCredentialsRoles(credentials).includes('MARBLE_ADMIN');
