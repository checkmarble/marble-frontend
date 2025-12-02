import { BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { CreationPage } from '@app-builder/components/ContinuousScreening/CreationPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { useLoaderData } from '@remix-run/react';
import { redirect } from '@remix-run/server-runtime';
import { z } from 'zod/v4';

const urlParamsSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const handle = {
  BreadCrumbs: [
    ({ data }: BreadCrumbProps<typeof loader>) => {
      return <span>New: {data.name}</span>;
    },
  ],
};

export const loader = createServerFn([authMiddleware], async ({ request }) => {
  const params = await parseQuerySafe(request, urlParamsSchema);
  if (!params.success) {
    // TODO: What do we do here?
    return redirect(getRoute('/continuous-screening/configurations'), {
      status: 302,
    });
  }

  return {
    name: params.data.name,
    description: params.data.description ?? '',
  };
});

export default function CreateContinuousScreeningConfigurationPage() {
  const { name, description } = useLoaderData<typeof loader>();

  return <CreationPage name={name} description={description} />;
}
