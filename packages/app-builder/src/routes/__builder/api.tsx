import { Page } from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Harddrive } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import SwaggerUI from 'swagger-ui-react';

export const handle = {
  i18n: ['navigation'] satisfies Namespace,
};

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
        <SwaggerUI
          spec={openapi}
          supportedSubmitMethods={[]}
          defaultModelExpandDepth={5}
          defaultModelsExpandDepth={4}
        />
      </Page.Content>
    </Page.Container>
  );
}
