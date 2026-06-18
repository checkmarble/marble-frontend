import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useAddCommentMutation } from '@app-builder/queries/cases/add-comment';
import { useCreateKycEnrichmentQuery } from '@app-builder/queries/cases/create-kyc-enrichment';
import * as Sentry from '@sentry/tanstackstart-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Markdown, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Callout } from '../../Callout';
import { PanelContainer, PanelRoot } from '../../Panel';
import { Spinner } from '../../Spinner';

type KycEnrichmentPanelProps = {
  caseId: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

export function KycEnrichmentPanel({ caseId, open, onOpenChange }: KycEnrichmentPanelProps) {
  const { t } = useTranslation(['cases', 'common']);
  const revalidate = useLoaderRevalidator();
  const [isCommentAdded, setIsCommentAdded] = useState(false);

  const { data, isPending, error, refetch, isSuccess, status } = useCreateKycEnrichmentQuery(caseId);
  const addCommentMutation = useAddCommentMutation();
  const kycCaseEnrichment = data?.kycCaseEnrichments[0];

  useEffect(() => {
    if (open && status !== 'success') {
      refetch();
    }
  }, [open, status, refetch]);

  useEffect(() => {
    if ((error || (isSuccess && !data.success)) && open) {
      toast.error(t('cases:kyc_enrichment.loading.toaster.error'));
      onOpenChange(false);
    }
  }, [error, isSuccess, data?.success, open, onOpenChange, t]);

  const handleAddComment = async () => {
    if (!kycCaseEnrichment) return;

    const comment =
      kycCaseEnrichment.analysis +
      '\n\n' +
      kycCaseEnrichment.citations
        .map((citation, index) => `\\[${index + 1}\\] [${citation.title}](${citation.url} "${citation.title}")`)
        .join('\n');

    try {
      await addCommentMutation.mutateAsync({ caseId, comment, files: [] });
      setIsCommentAdded(true);
      toast.success(t('cases:kyc_enrichment.comment_added.toaster.success'));
      revalidate();
      onOpenChange(false);
    } catch (e) {
      Sentry.captureException(e);
      toast.error(t('cases:kyc_enrichment.comment_added.toaster.error'));
    }
  };

  return (
    <PanelRoot open={open} onOpenChange={onOpenChange}>
      <PanelContainer size="4xl">
        <div className="flex items-center gap-sm pb-md border-b border-grey-border">
          <Icon icon="ai-review" className="size-5 text-purple-primary shrink-0" />
          <Typo variant="title2" className="flex-1 text-grey-primary">
            {t('cases:kyc_enrichment.title')}
          </Typo>
          <Icon
            icon="cross"
            className="size-5 cursor-pointer text-grey-secondary hover:text-grey-primary shrink-0"
            onClick={() => onOpenChange(false)}
            aria-label={t('common:close')}
          />
        </div>

        <div className="flex flex-col gap-md flex-1 overflow-y-auto py-md">
          {isPending ? (
            <div className="flex flex-col gap-md">
              <div className="flex justify-center gap-sm">
                <Spinner className="size-6" />
                <span>{t('cases:kyc_enrichment.loading')}</span>
              </div>
              <AnalysisSkeleton />
            </div>
          ) : null}
          {error ? <Callout variant="outlined">{error.message}</Callout> : null}
          {isSuccess && data.success && kycCaseEnrichment ? (
            <>
              <Callout variant="outlined">
                {t('cases:kyc_enrichment.for')} <strong>{kycCaseEnrichment.entityName}</strong>
              </Callout>
              <div>
                <Markdown>{kycCaseEnrichment.analysis}</Markdown>
                <div className="mt-md">
                  {kycCaseEnrichment.citations.map((citation, index) => (
                    <div key={`citation.${index}`} className="mb-sm">
                      <span>[{index + 1}]</span>{' '}
                      <a
                        className="text-purple-primary hover:bg-purple-background hover:text-grey-secondary"
                        href={citation.url}
                      >
                        {citation.title}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="pt-md border-t border-grey-border mt-auto flex items-center justify-end gap-xs">
          <Button
            disabled={addCommentMutation.isPending || !isSuccess || isCommentAdded}
            variant="primary"
            onClick={() => handleAddComment()}
          >
            {t('cases:kyc_enrichment.attach_to_case')}
          </Button>
          <Button disabled={addCommentMutation.isPending} variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common:close')}
          </Button>
        </div>
      </PanelContainer>
    </PanelRoot>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="flex flex-row gap-lg p-md">
      <div className="flex h-fit flex-2 flex-col gap-sm">
        <div className="flex flex-row items-center justify-between gap-sm">
          <div className="bg-grey-border h-4 w-32 animate-pulse rounded-md" />
        </div>
        <div className="bg-grey-border h-12 animate-pulse rounded-lg" />
        <div className="bg-grey-border h-14 animate-pulse rounded-lg" />
        <div className="bg-grey-border h-12 animate-pulse rounded-lg" />
        <div className="bg-grey-border h-16 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
