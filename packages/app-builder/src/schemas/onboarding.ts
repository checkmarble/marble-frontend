import z from 'zod/v4';

export const MIN_PASSWORD_LENGTH = 8;

/**
 * Payload sent to the API. `password` is omitted on OIDC instances, where
 * credentials are owned by the identity provider.
 */
export const createInitialOrgPayloadSchema = z.object({
  organization: z.string().nonempty(),
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.email(),
  password: z.string().min(MIN_PASSWORD_LENGTH).optional(),
});

export type CreateInitialOrgPayload = z.infer<typeof createInitialOrgPayloadSchema>;

/**
 * The confirmation field never leaves the browser: both password inputs are
 * folded into the single `password` of the payload above once they match.
 * On OIDC instances the pair is neither shown nor validated.
 */
export const getOnboardingFormSchema = (requiresPassword: boolean) =>
  createInitialOrgPayloadSchema
    .omit({ password: true })
    .extend({
      password: z.string(),
      passwordConfirmation: z.string(),
    })
    .refine(
      ({ password, passwordConfirmation }) =>
        !requiresPassword || (password.length >= MIN_PASSWORD_LENGTH && password === passwordConfirmation),
      { path: ['password'] },
    );

export type OnboardingFormValues = z.infer<ReturnType<typeof getOnboardingFormSchema>>;
