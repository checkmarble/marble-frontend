import { z } from 'zod/v4';

const ROLE_ADMIN = 'ADMIN';
const ROLE_PUBLISHER = 'PUBLISHER';
const ROLE_BUILDER = 'BUILDER';
const ROLE_VIEWER = 'VIEWER';
const ROLE_ANALYST = 'ANALYST';

export const USER_ROLES = [ROLE_ADMIN, ROLE_PUBLISHER, ROLE_BUILDER, ROLE_VIEWER, ROLE_ANALYST] as const;

// Global Backoffice management can provision the internal operator role as well.
export const GLOBAL_USER_ROLES = [...USER_ROLES, 'MARBLE_ADMIN'] as const;

export const createUserPayloadSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.email(),
  role: z.enum(USER_ROLES),
});

export type CreateUserPayload = z.infer<typeof createUserPayloadSchema>;

const globalUserDetailsSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.email(),
  role: z.enum(GLOBAL_USER_ROLES),
});

export const createGlobalUserPayloadSchema = globalUserDetailsSchema;
export type CreateGlobalUserPayload = z.infer<typeof createGlobalUserPayloadSchema>;

export const updateGlobalUserPayloadSchema = globalUserDetailsSchema.extend({
  userId: z.uuid(),
  organization_id: z.uuid().optional(),
});
export type UpdateGlobalUserPayload = z.infer<typeof updateGlobalUserPayloadSchema>;

/**
 * Error code thrown by `createOrganizationUserFn` when the email is already taken, so the
 * client can tell that case apart from a generic failure.
 */
export const DUPLICATE_EMAIL_ERROR = 'duplicate_email';

// Roles a user can hold on an organization through a direct grant.
export const GRANT_ROLES = USER_ROLES;
export type GrantRole = (typeof GRANT_ROLES)[number];

export const userGrantsInputSchema = z.object({
  userId: z.uuid(),
});

export const organizationGrantTargetSchema = z.object({
  userId: z.uuid(),
  tenantId: z.uuid(),
  organizationId: z.uuid(),
});
export type OrganizationGrantTarget = z.infer<typeof organizationGrantTargetSchema>;

export const replaceOrganizationGrantPayloadSchema = organizationGrantTargetSchema.extend({
  role: z.enum(GRANT_ROLES),
});
export type ReplaceOrganizationGrantPayload = z.infer<typeof replaceOrganizationGrantPayloadSchema>;

/**
 * Error codes thrown by the grant server functions, so the client can tell a stale panel (the
 * organization or user moved out of the tenant) apart from a missing permission.
 */
export const GRANT_NOT_FOUND_ERROR = 'grant_not_found';
export const GRANT_FORBIDDEN_ERROR = 'grant_forbidden';
