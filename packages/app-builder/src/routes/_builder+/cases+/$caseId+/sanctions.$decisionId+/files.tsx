import { FilesList } from '@app-builder/components/Files/FilesList';
import { initServerServices } from '@app-builder/services/init.server';
import {
  getSanctionCheckFileDownloadEndpoint,
  getSanctionCheckFileUploadEndpoint,
} from '@app-builder/utils/files';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { sanctionCheck: sanctionCheckRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const decisionId = fromParams(params, 'decisionId');
  const sanctionCheck = (await sanctionCheckRepository.listSanctionChecks({ decisionId }))[0];

  if (!sanctionCheck) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }

  return {
    files: await sanctionCheckRepository.listSanctionCheckFiles({
      sanctionCheckId: sanctionCheck.id,
    }),
    sanctionCheck,
  };
}

export default function SanctionCheckFilesPage() {
  const { files, sanctionCheck } = useLoaderData<typeof loader>();
  const downloadEnpoint = useCallbackRef(getSanctionCheckFileDownloadEndpoint(sanctionCheck));
  const uploadEnpoint = getSanctionCheckFileUploadEndpoint(sanctionCheck);

  return (
    <FilesList files={files} downloadEnpoint={downloadEnpoint} uploadEnpoint={uploadEnpoint} />
  );
}
