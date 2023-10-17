import { Page } from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { downloadBlob } from '@app-builder/utils/download-blob';
import { json, type LinksFunction, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button } from '@ui-design-system';
import { Download, Harddrive } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import SwaggerUI from 'swagger-ui-react';
import swaggercss from 'swagger-ui-react/swagger-ui.css';

export const handle = {
  i18n: ['navigation', 'api'] satisfies Namespace,
};

export const links: LinksFunction = () =>
  swaggercss ? [{ rel: 'stylesheet', href: swaggercss }] : [];

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const openapi = await dataModelRepository.getOpenApiSpec();
  // Remove those parts, because they are part of the proper openapi spec but we do not want them as input to SwaggerUI
  delete openapi.info;
  delete openapi.components?.securitySchemes;
  delete openapi.components?.securitySchemes;
  return json({ openapi });
}

export default function Api() {
  const { t } = useTranslation(handle.i18n);
  const { openapi } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="items-center: flex flex-row items-center">
          <Harddrive className="mr-2" height="24px" width="24px" />
          {t('navigation:api')}
        </div>
      </Page.Header>
      <Page.Content>
        <div className="flex">
          <Button
            variant="secondary"
            onClick={() => {
              const blob = new Blob([JSON.stringify(openapi)], {
                type: 'application/json;charset=utf-8,',
              });
              void downloadBlob(blob, 'openapi.json');
            }}
          >
            <Download className="mr-2" height="24px" width="24px" />
            {t('api:download_openapi_spec')}
          </Button>
        </div>
        <div className="-mx-5">
          {/* Issue with UNSAFE_componentWillReceiveProps: https://github.com/swagger-api/swagger-ui/issues/5729 */}
          <SwaggerUI
            spec={openapi}
            supportedSubmitMethods={[]}
            defaultModelExpandDepth={5}
            defaultModelsExpandDepth={4}
          />
        </div>
      </Page.Content>
    </Page.Container>
  );
}
