import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { Page } from '@app-builder/components/Page';
import { pageLayoutGutter } from '@app-builder/components/Page/page-layout';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { isAdmin } from '@app-builder/models';
import { CaseDetail } from '@app-builder/models/cases';
import { ContinuousScreening } from '@app-builder/models/continuous-screening';
import { Inbox } from '@app-builder/models/inbox';
import { useCloseCaseMutation } from '@app-builder/queries/cases/close-case';
import { editTagsPayloadSchema, useEditTagsMutation } from '@app-builder/queries/cases/edit-tags';
import { useOpenCaseMutation } from '@app-builder/queries/cases/open-case';
import { getNextUnassignedCaseFn } from '@app-builder/server-fns/cases';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Card, CtaV2ClassName, cn, TagList } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ReviewStatusBadge } from '../ContinuousScreening/ReviewStatusBadge';
import { CaseInfo } from './CaseInfo';
import { ScreeningMatchList } from './ContinuousScreening/MatchList';
import { RequestSideInfo } from './ContinuousScreening/RequestSideInfo';
import { EscalateCaseButton } from './EscalateCaseButton';

type ContinuousScreeningPageProps = {
  caseDetail: CaseDetail;
  screening: ContinuousScreening;
  inboxes: Inbox[];
};

export function ContinuousScreeningPage({ caseDetail, inboxes, screening }: ContinuousScreeningPageProps) {
  const { t } = useTranslation(['common']);
  const { currentUser } = useOrganizationDetails();
  const { orgTags } = useOrganizationTags();
  const isUserAdmin = isAdmin(currentUser);
  const revalidate = useLoaderRevalidator();
  const hasRemainingMatchesToExamine = screening.matches.some((match) => match.status === 'pending');

  const getNextUnassignedCase = useServerFn(getNextUnassignedCaseFn);
  const router = useRouter();
  const nextUnassignedCaseHref = router.buildLocation({
    to: '/ressources/cases/next-unassigned/$caseId',
    params: { caseId: fromUUIDtoSUUID(caseDetail.id) },
  }).href;

  const closeCaseMutation = useCloseCaseMutation();
  const reopenCaseMutation = useOpenCaseMutation();
  const handleCloseCase = () => {
    closeCaseMutation
      .mutateAsync({ caseId: caseDetail.id, comment: '' })
      .then(() => revalidate())
      .catch(() => toast.error(t('common:errors.unknown')));
  };

  const handleReopenCase = () => {
    reopenCaseMutation
      .mutateAsync({ caseId: caseDetail.id, comment: '' })
      .then(() => revalidate())
      .catch(() => toast.error(t('common:errors.unknown')));
  };

  const editTagsMutation = useEditTagsMutation();
  const caseTagsIds = caseDetail.tags.map((t) => t.tagId);

  const tagsForm = useForm({
    onSubmit: ({ value }) => {
      editTagsMutation.mutateAsync(value);
    },
    defaultValues: {
      caseId: caseDetail.id,
      tagIds: caseTagsIds,
    },
    validators: {
      onSubmit: editTagsPayloadSchema,
    },
  });

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        <div className="flex gap-sm">
          {caseDetail.status !== 'closed' ? (
            <Button
              variant="primary"
              className="flex-1 first-letter:capitalize"
              disabled={hasRemainingMatchesToExamine}
              onClick={handleCloseCase}
            >
              <Icon icon="save" className="size-3.5" />
              {t('cases:case.close')}
            </Button>
          ) : (
            <Button variant="primary" className="flex-1 first-letter:capitalize" onClick={handleReopenCase}>
              <Icon icon="save" className="size-3.5" />
              {t('cases:case.reopen')}
            </Button>
          )}
          <a
            href={nextUnassignedCaseHref}
            aria-label={t('cases:next_unassigned_case')}
            className={cn(CtaV2ClassName({ variant: 'secondary' }), 'hover:bg-grey-background')}
            onClick={(e) => {
              // let modified clicks (cmd/ctrl/shift/alt) reach the browser to open a new tab
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              getNextUnassignedCase({ data: { caseId: caseDetail.id } });
            }}
          >
            <span>{t('cases:next_unassigned_case')}</span>
            <Icon icon="arrow-right" className="size-4" />
          </a>
        </div>
      </Page.Header>
      <Page.Container>
        <Page.Content className={cn('grid grid-cols-1 lg:grid-cols-[2fr_1fr]', pageLayoutGutter.padding)}>
          <div className="flex flex-col gap-lg not-lg:contents">
            <div className="flex flex-col gap-sm order-1">
              <div className="flex justify-between gap-md">
                <div className="flex gap-sm">
                  <ReviewStatusBadge status={screening.status} hitsCount={screening.matches.length} />
                  <tagsForm.Field name="tagIds">
                    {(field) => (
                      <TagList
                        editable
                        placeholder={t('cases:manager.principal.add_tag_placeholder')}
                        tags={orgTags}
                        value={field.state.value}
                        onChange={(tags) => {
                          tagsForm.setFieldValue('tagIds', tags);
                          tagsForm.handleSubmit();
                        }}
                      />
                    )}
                  </tagsForm.Field>
                </div>
                <div>
                  {caseDetail.status !== 'closed' ? (
                    <EscalateCaseButton caseId={caseDetail.id} inboxId={caseDetail.inboxId} className="ms-auto" />
                  ) : null}
                </div>
              </div>
              <Card className="text-small">
                <CaseInfo caseDetail={caseDetail} currentUser={currentUser} />
              </Card>
            </div>
            <ScreeningMatchList screening={screening} isUserAdmin={isUserAdmin} caseDetail={caseDetail} />
          </div>
          <RequestSideInfo caseDetail={caseDetail} screening={screening} />
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
