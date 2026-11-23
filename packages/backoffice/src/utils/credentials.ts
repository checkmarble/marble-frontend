import type { CredentialsDto } from 'marble-api/generated/marblecore-api';

type Credentials = Pick<CredentialsDto['credentials'], 'roles'>;

export const getCredentialsRoles = (credentials: Credentials): string[] => credentials.roles ?? [];

export const isMarbleAdmin = (credentials: Credentials) => getCredentialsRoles(credentials).includes('MARBLE_ADMIN');
