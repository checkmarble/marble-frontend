import { Page } from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { json, type LinksFunction, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Download, Harddrive } from '@ui-icons';
import clsx from 'clsx';
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

const generateJsonOpenapiLink = (openapi: string): string => {
  const blob = new Blob([openapi], {
    type: 'application/json;charset=utf-8,',
  });
  return URL.createObjectURL(blob);
};

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
          <a
            href={generateJsonOpenapiLink(JSON.stringify(openapi))}
            download={'openapi.json'}
            className={clsx(
              'text-s flex flex-row items-center justify-center gap-1 rounded border border-solid px-4 py-2 font-semibold outline-none',
              'hover:bg-grey-05 active:bg-grey-10 bg-grey-00 border-grey-10 text-grey-100 disabled:text-grey-50 disabled:border-grey-05 disabled:bg-grey-05 focus:border-purple-100'
            )}
          >
            <Download className="mr-2" height="24px" width="24px" />
            {t('api:download_openapi_spec')}
          </a>
        </div>
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
