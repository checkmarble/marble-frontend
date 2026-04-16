import { type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { CreationPage } from '@app-builder/components/ContinuousScreening/CreationPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import { z } from 'zod/v4';

const searchSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

const createConfigurationLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(z.object({ name: z.string(), description: z.string().optional() }))
  .handler(async function continuousScreeningCreateLoader({ data: { name, description } }) {
    return { name, description: description ?? '' };
  });

export const Route = createFileRoute('/_app/_builder/continuous-screening/create/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { name, description } }) => ({ name, description }),
  loader: ({ deps }) => {
    if (!deps.name) {
      throw redirect({ to: '/continuous-screening/configurations' });
    }
    return createConfigurationLoader({ data: { name: deps.name, description: deps.description } });
  },
  staticData: {
    i18n: ['continuousScreening'],
    BreadCrumbs: [
      (_: BreadCrumbProps) => {
        const { t } = useTranslation(['continuousScreening']);
        const { name } = Route.useLoaderData();
        return <span>{t('continuousScreening:creation.title', { name })}</span>;
      },
    ],
  },
  component: CreateContinuousScreeningConfigurationPage,
});

function CreateContinuousScreeningConfigurationPage() {
  const { name, description } = Route.useLoaderData();

  return <CreationPage name={name} description={description} />;
}
