import { Page } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { initServerServices } from '@app-builder/services/init.server';
import { downloadFile } from '@app-builder/utils/download-file';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LinksFunction, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { Namespace } from 'i18next';
import * as React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import swaggercss from 'swagger-ui-react/swagger-ui.css?url';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

const SwaggerUI = React.lazy(() => import('swagger-ui-react'));

export const handle = {
  i18n: ['common', 'navigation', 'api'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/api')} isLast={isLast}>
          <Icon icon="world" className="me-2 size-6" />
          <span className="line-clamp-1 text-start">{t('navigation:api')}</span>
        </BreadCrumbLink>
      );
    },
  ],
};

export const links: LinksFunction = () =>
  swaggercss ? [{ rel: 'stylesheet', href: swaggercss }] : [];

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const openapi = await dataModelRepository.getOpenApiSpec();
  return json({ openapi });
}

export default function Api() {
  const { t } = useTranslation(handle.i18n);
  const { openapi } = useLoaderData<typeof loader>();

  // Remove those parts, because they are part of the proper openapi spec but we do not want them as input to SwaggerUI
  const openapiWithoutSomeParts = React.useMemo(() => {
    const openapiWithoutSomeParts = R.clone(openapi);
    delete openapiWithoutSomeParts.info;
    delete openapiWithoutSomeParts.components?.securitySchemes;
    return openapiWithoutSomeParts;
  }, [openapi]);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <div className="flex">
            <Button
              variant="secondary"
              onClick={() => {
                try {
                  const blob = new Blob([JSON.stringify(openapi)], {
                    type: 'application/json;charset=utf-8,',
                  });
                  const url = URL.createObjectURL(blob);
                  void downloadFile(url, 'openapi.json');
                } catch (error) {
                  toast.error(t('common:errors.unknown'));
                }
              }}
            >
              <Icon icon="download" className="me-2 size-6" />
              {t('api:download_openapi_spec')}
            </Button>
          </div>
          <div className="-mx-5">
            <React.Suspense fallback={t('common:loading')}>
              {/* Issue with UNSAFE_componentWillReceiveProps: https://github.com/swagger-api/swagger-ui/issues/5729 */}
              <SwaggerUI
                spec={openapiWithoutSomeParts}
                supportedSubmitMethods={[]}
                defaultModelExpandDepth={5}
                defaultModelsExpandDepth={4}
              />
            </React.Suspense>
          </div>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
