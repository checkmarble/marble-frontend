import { FilesList } from '@app-builder/components/Files/FilesList';
import { useUploadScreeningFile } from '@app-builder/queries/upload-screening-file';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { sanctionCheck: sanctionCheckRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const decisionId = fromParams(params, 'decisionId');
  const screeningId = fromParams(params, 'screeningId');
  const sanctionChecks = await sanctionCheckRepository.listSanctionChecks({ decisionId });
  const sanctionCheck = sanctionChecks.find((s) => s.id === screeningId);

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
  const { mutateAsync: uploadScreeningFile } = useUploadScreeningFile(sanctionCheck.id);

  const downloadEndpoint = (fileId: string) => {
    return getRoute('/ressources/screenings/download/:screeningId/:fileId', {
      screeningId: sanctionCheck.id,
      fileId,
    });
  };

  return (
    <FilesList
      files={files}
      downloadEndpoint={downloadEndpoint}
      uploadEndpoint={uploadScreeningFile}
    />
  );
}
