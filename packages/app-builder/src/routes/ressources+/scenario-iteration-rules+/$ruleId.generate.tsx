import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import invariant from 'tiny-invariant';
import { z } from 'zod/v4';

const generateRuleBodySchema = z.object({
  instruction: z.string().nonempty(),
});

export const action = createServerFn([authMiddleware], async function generateRuleAction({ request, context, params }) {
  const { scenarioIterationRuleRepository } = context.authInfo;
  const ruleId = params['ruleId'];
  invariant(ruleId, 'ruleId is required');

  const raw = await request.json();
  const parsed = generateRuleBodySchema.safeParse(raw);

  if (!parsed.success) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  await scenarioIterationRuleRepository.generateRuleAst({
    ruleId,
    instruction: parsed.data.instruction,
  });

  return new Response(null, { status: 204 });
});
