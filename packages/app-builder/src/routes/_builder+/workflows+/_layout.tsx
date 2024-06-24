import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/node';

export async function loader() {
  const { featureAccessService } = serverServices;
  const isWorkflowsAvailable =
    await featureAccessService.isWorkflowsAvailable();
  if (!isWorkflowsAvailable) {
    return redirect(getRoute('/'));
  }
  return null;
}
