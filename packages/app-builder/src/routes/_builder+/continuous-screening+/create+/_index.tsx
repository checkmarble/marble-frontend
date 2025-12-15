import { BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { CreationPage } from '@app-builder/components/ContinuousScreening/CreationPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { useLoaderData } from '@remix-run/react';
import { redirect } from '@remix-run/server-runtime';
import { Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { z } from 'zod/v4';

const urlParamsSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const handle = {
  i18n: ['continuousScreening'] satisfies Namespace,
  BreadCrumbs: [
    ({ data }: BreadCrumbProps<typeof loader>) => {
      const { t } = useTranslation(['continuousScreening']);
      return <span>{t('continuousScreening:creation.title', { name: data.name })}</span>;
    },
  ],
};

export const loader = createServerFn([authMiddleware], async ({ request }) => {
  const params = await parseQuerySafe(request, urlParamsSchema);
  if (!params.success) {
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
