import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useAddCommentMutation } from '@app-builder/queries/cases/add-comment';
import { useCreateKycEnrichmentQuery } from '@app-builder/queries/cases/create-kyc-enrichment';
import * as Sentry from '@sentry/remix';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Markdown, Modal, ScrollAreaV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Callout } from '../Callout';
import { Spinner } from '../Spinner';

export function KycEnrichment({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);
  const [isCommentAdded, setIsCommentAdded] = useState(false);
  const revalidate = useLoaderRevalidator();
  const { t } = useTranslation(['cases', 'common']);

  const { data, isPending, error, refetch, isSuccess, status } = useCreateKycEnrichmentQuery(caseId);
  const addCommentMutation = useAddCommentMutation();

  useEffect(() => {
    if ((error || (isSuccess && !data.success)) && open) {
      toast.error(t('cases:kyc_enrichment.loading.toaster.error'));
      setOpen(false);
    }
  }, [error, isSuccess, data?.success, open]);

  const handleAddComment = async () => {
    const comment =
      data?.kycCaseEnrichments[0].analysis +
      '\n\n' +
      data?.kycCaseEnrichments[0].citations
        .map(
          (citation: { title: string; url: string }, index: number) =>
            `\[${index + 1}\] [${citation.title}](${citation.url} "${citation.title}")`,
        )
        .join('\n');

    try {
      await addCommentMutation.mutateAsync({
        caseId,
        comment,
        files: [],
      });
      setIsCommentAdded(true);
      toast.success(t('cases:kyc_enrichment.comment_added.toaster.success'));
      // await new Promise((resolve) => setTimeout(resolve, 100));
      revalidate();
      setOpen(false);
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t('cases:kyc_enrichment.comment_added.toaster.error'));
    }
  };

  const handleOpen = () => {
    if (status !== 'success') refetch();
    setOpen(true);
  };

  const AnalysisSkeleton = () => (
    <div className="flex flex-row gap-6 p-4">
      <div className="flex h-fit flex-2 flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="bg-grey-90 h-4 w-32 animate-pulse rounded-md" />
        </div>
        <div className="bg-grey-90 h-12 animate-pulse rounded-lg" />
        <div className="bg-grey-90 h-14 animate-pulse rounded-lg" />
        <div className="bg-grey-90 h-12 animate-pulse rounded-lg" />
        <div className="bg-grey-90 h-16 animate-pulse rounded-lg" />
      </div>
    </div>
  );

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <ButtonV2 variant="secondary" className="align-baseline" onClick={() => handleOpen()}>
          <Icon icon="ai-review" className="size-5" /> {t('cases:kyc_enrichment.title')}
        </ButtonV2>
      </Modal.Trigger>
      <Modal.Content size="xlarge" className="h-[90vh] flex flex-col">
        <Modal.Title>{t('cases:kyc_enrichment.title')}</Modal.Title>
        <div className="flex flex-col gap-4 py-8 px-4 flex-1 min-h-0">
          {isPending && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-center gap-2">
                <Spinner className="size-6" />
                <span>{t('cases:kyc_enrichment.loading')}</span>
              </div>
              <AnalysisSkeleton />
            </div>
          )}
          {error && <Callout variant="outlined">{error.message}</Callout>}
          {isSuccess && data.success ? (
            <div className="flex flex-col gap-4 flex-1 min-h-0">
              <Callout variant="outlined">
                {t('cases:kyc_enrichment.for')} <strong>{data.kycCaseEnrichments[0].entityName}</strong>
              </Callout>
              <ScrollAreaV2 orientation="vertical" className="flex-1 min-h-0">
                <div className="p-4">
                  <Markdown>{data.kycCaseEnrichments[0].analysis}</Markdown>
                  <div className="mt-4">
                    {data.kycCaseEnrichments[0].citations.map((citation: any, index: number) => (
                      <div key={`citation.${index}`} className="mb-2">
                        <span>[{index + 1}]</span>
                        <span>
                          <a className="text-purple-65 hover:bg-purple-96 hover:text-grey-50" href={citation.url}>
                            {citation.title}
                          </a>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollAreaV2>
            </div>
          ) : null}
        </div>
        <Modal.Footer>
          <div className="flex flex-1 flex-row gap-2 p-4 justify-end">
            <ButtonV2
              disabled={addCommentMutation.isPending || !isSuccess || isCommentAdded}
              variant="primary"
              onClick={() => handleAddComment()}
            >
              {t('cases:kyc_enrichment.attach_to_case')}
            </ButtonV2>
            <Modal.Close asChild>
              <ButtonV2 disabled={addCommentMutation.isPending} variant="secondary" onClick={() => setOpen(false)}>
                {t('common:close')}
              </ButtonV2>
            </Modal.Close>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
