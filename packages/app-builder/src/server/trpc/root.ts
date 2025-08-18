import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { type Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  workflow: router({
    getLatestReferences: publicProcedure
      .input(z.object({ scenarioId: z.string().min(1) }))
      .query(async ({ input, ctx }) => {
        const auth = ctx.auth;
        if (!auth) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }
        const references = await auth.scenario.getLatestRulesReferences(input.scenarioId);
        return references.sort((a, b) => Number(b.latestVersion) - Number(a.latestVersion));
      }),
  }),
});

export type AppRouter = typeof appRouter;
