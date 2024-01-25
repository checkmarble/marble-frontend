// import { type LoaderFunctionArgs } from '@remix-run/node';
import { Page } from '@app-builder/components';
import { json, useLoaderData } from '@remix-run/react';
import jwt from 'jsonwebtoken';
import { Icon } from 'ui-icons';

export function loader() {
  const METABASE_SITE_URL = 'https://marble.metabaseapp.com';
  const METABASE_SECRET_KEY = 'dummy';

  const payload = {
    resource: { question: 77 },
    params: {
      org_id: ['b781246b-908f-46eb-a431-4a841fe3cef5'],
    },
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minute expiration
  };
  const token = jwt.sign(payload, METABASE_SECRET_KEY);

  const iframeUrl =
    METABASE_SITE_URL +
    '/embed/question/' +
    token +
    '#bordered=true&titled=true';

  return json({
    url: iframeUrl,
  });
}

export default function Analytics() {
  const { url } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center">
          <Icon icon="harddrive" className="mr-2 size-6" />
          {'Your analytics'}
        </div>
      </Page.Header>
      <Page.Content>
        <iframe
          src={url}
          title={'bla'}
          frameBorder="0"
          width="800"
          height="600"
        ></iframe>
      </Page.Content>
    </Page.Container>
  );
}
