import { Page } from '@marble-front/builder/components/Page';
import { useTranslation } from 'react-i18next';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Scenarios } from '@marble-front/ui/icons';

import type { Scenario } from '@marble-front/api/marble';

import { faker } from '@faker-js/faker';
import type { PlainMessage } from '@bufbuild/protobuf';
import { Tag } from '@marble-front/ui/design-system';

const fakeScenarios: PlainMessage<Scenario>[] = Array.from({
  length: 25,
}).map(() => {
  const versions = Array.from({ length: Math.floor(Math.random() * 10) }).map(
    (_) => ({
      id: faker.database.mongodbObjectId(),
      rules: [],
    })
  );

  return {
    id: faker.database.mongodbObjectId(),
    name: faker.name.fullName(),
    description: faker.lorem.sentences(),
    mainTable: faker.name.lastName(),
    versions,
    activeVersion: versions?.[versions?.length - 1],
  };
});

export async function loader() {
  /** TODO(data): get list from API */

  return json(fakeScenarios);
}

export const handle = {
  i18n: ['scenarios', 'navigation'],
};

export default function ScenariosPage() {
  const { t } = useTranslation(['navigation', 'scenarios']);
  const data = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header>
        <Scenarios className="mr-2" height="24px" width="24px" />
        {t('navigation:scenarios')}
      </Page.Header>
      <Page.Content className="gap-4">
        {data.length ? (
          data.map(({ id, name, description, activeVersion }) => (
            <Link key={id} to={`/scenarios/${id}/view/trigger`}>
              <div className="bg-grey-00 border-grey-10 flex max-w-3xl flex-col gap-1 rounded-lg border border-solid p-4 hover:drop-shadow-md">
                <div className="text-text-m-bold flex flex-row gap-2">
                  {name}
                  {activeVersion && (
                    <Tag color="purple" className="capitalize">
                      {t('scenarios:live')}
                    </Tag>
                  )}
                </div>
                <p className="text-text-s-medium line-clamp-2">{description}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-grey-00 border-grey-10 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
            <p className="text-text-s-medium">
              {t('scenarios:empty_scenario_list')}
            </p>
          </div>
        )}
      </Page.Content>
    </Page.Container>
  );
}
