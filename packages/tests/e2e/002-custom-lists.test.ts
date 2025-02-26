import { expect, test } from 'tests/fixtures';
import { CustomListDetailPage, CustomListsPage } from 'tests/page-object-models/custom-lists';

const user = {
  email: 'admin@e2e.com',
  password: 'password',
};

test.beforeAll(async ({ firebase }) => {
  await firebase.createUser(user);
});

test.afterAll(async ({ firebase }) => {
  await firebase.deleteUser(user.email);
});

test('CRUD a custom list', async ({ page, authenticate }) => {
  await authenticate.withTestUser(user);

  const list = {
    name: 'list to create and delete',
    description: 'Test description',
    values: ['value 1', 'value 2', 'value 3'],
  };

  const customListsPage = new CustomListsPage(page);
  await customListsPage.goto();
  await customListsPage.create(list);

  const customListDetailPage = new CustomListDetailPage(page);

  list.name = 'Updated list name';
  list.description = 'Updated description';

  await customListDetailPage.update(list);

  for (const value of list.values) {
    await customListDetailPage.createNewValue(value);
  }
  for (const value of list.values) {
    await customListDetailPage.deleteValue(value);
  }

  await customListDetailPage.goBack();

  await customListsPage.open(list.name);

  await customListDetailPage.delete();

  await expect(page.getByText(list.name)).not.toBeVisible();
});
