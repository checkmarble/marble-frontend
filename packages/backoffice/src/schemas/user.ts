import { z } from 'zod/v4';

const ROLE_ADMIN = 'ADMIN';
const ROLE_PUBLISHER = 'PUBLISHER';
const ROLE_BUILDER = 'BUILDER';
const ROLE_VIEWER = 'VIEWER';
const ROLE_ANALYST = 'ANALYST';

export const USER_ROLES = [ROLE_ADMIN, ROLE_PUBLISHER, ROLE_BUILDER, ROLE_VIEWER, ROLE_ANALYST] as const;

export const createUserPayloadSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.email(),
  role: z.enum(USER_ROLES),
});

export type CreateUserPayload = z.infer<typeof createUserPayloadSchema>;
