import type { TRPCRouter } from '@bo/integrations/trpc/router';
import { createTRPCContext } from '@trpc/tanstack-react-query';

export const { TRPCProvider, useTRPC } = createTRPCContext<TRPCRouter>();
