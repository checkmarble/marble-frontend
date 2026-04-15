import { FilesList } from '@app-builder/components/Files/FilesList';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useUploadScreeningFile } from '@app-builder/queries/upload-screening-file';
import { fromParams } from '@app-builder/utils/short-uuid';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const screeningFilesLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function screeningFilesLoader({ context, data }) {
    const { screening: screeningRepository } = context.authInfo;

    const decisionId = fromParams(data?.params ?? {}, 'decisionId');
    const screeningId = fromParams(data?.params ?? {}, 'screeningId');
    const screenings = await screeningRepository.listScreenings({ decisionId });
    const screening = screenings.find((s) => s.id === screeningId);

    if (!screening) {
      throw new Response(null, { status: 404, statusText: 'Not Found' });
    }

    return {
      files: await screeningRepository.listScreeningFiles({
        screeningId: screening.id,
      }),
      screening,
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/$caseId/d/$decisionId/screenings/$screeningId/files')({
  loader: ({ params }) => screeningFilesLoader({ data: { params } }),
  component: ScreeningFilesPage,
});

function ScreeningFilesPage() {
  const { files, screening } = Route.useLoaderData();
  const { mutateAsync: uploadScreeningFile } = useUploadScreeningFile(screening.id);

  return (
    <FilesList
      files={files}
      downloadEndpoint={(fileId) => `/ressources/screenings/download/${screening.id}/${fileId}`}
      uploadEndpoint={uploadScreeningFile}
    />
  );
}
