import { Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { initServerServices } from '@app-builder/services/init.server';
import { downloadFile } from '@app-builder/utils/download-file';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

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

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const [openapi, openapiV1] = await Promise.all([
    dataModelRepository.getOpenApiSpec(),
    dataModelRepository.getOpenApiSpecOfVersion('v1'),
  ]);

  return Response.json({ openapi, openapiV1 });
}

export default function Api() {
  const { t } = useTranslation(handle.i18n);
  const { openapi, openapiV1 } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <div className="flex flex-col gap-2  items-start">
            <Button
              variant="secondary"
              onClick={() => {
                try {
                  const blob = new Blob([JSON.stringify(openapiV1)], {
                    type: 'application/json;charset=utf-8,',
                  });
                  const url = URL.createObjectURL(blob);
                  void downloadFile(url, 'openapi-v1.json');
                } catch (_error) {
                  toast.error(t('common:errors.unknown'));
                }
              }}
            >
              <Icon icon="download" className="me-2 size-6" />
              {t('api:download_openapi_spec_v1')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                try {
                  const blob = new Blob([JSON.stringify(openapi)], {
                    type: 'application/json;charset=utf-8,',
                  });
                  const url = URL.createObjectURL(blob);
                  void downloadFile(url, 'openapi.json');
                } catch (_error) {
                  toast.error(t('common:errors.unknown'));
                }
              }}
            >
              <Icon icon="download" className="me-2 size-6" />
              {t('api:download_openapi_spec')}
            </Button>
          </div>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
