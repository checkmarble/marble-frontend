import { Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { useFormDropzone } from '@app-builder/hooks/useFormDropzone';
import { DataModel } from '@app-builder/models';
import {
  CaseDetail,
  PivotObject,
  SuspiciousActivityReport,
  SuspiciousActivityReportStatus,
} from '@app-builder/models/cases';
import {
  EditSuspicionPayload,
  editSuspicionPayloadSchema,
  useEditSuspicionMutation,
} from '@app-builder/queries/cases/edit-suspicion';
import { useSarReportsQuery } from '@app-builder/queries/cases/sar-report';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { getNextUnassignedCaseFn } from '@app-builder/server-fns/cases';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import type { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useForm, useStore } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ReactNode, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import {
  ActionBar,
  ActionButton,
  Button,
  CtaV2ClassName,
  cn,
  Modal,
  Radio,
  Tabs,
  Typo,
  tabClassName,
} from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CloseCase } from '../Cases/CloseCase';
import { OpenCase } from '../Cases/OpenCase';
import { SnoozeCase } from '../Cases/SnoozeCase';
import { ClientCommentForm } from './ClientComments';
import { CommentContext } from './hooks/comment-context';
import { KycEnrichmentPanel } from './KycEnrichment/KycEnrichmentPanel';

type CaseManagerPageLayoutProps = {
  caseDetail: CaseDetail;
  pivotObjects: PivotObject[];
  dataModel: DataModel;
  dataModelFeatureAccess: ReturnType<typeof dataModelFeatureAccessLoader>;
  children: ReactNode;
};

export function CaseManagerPageLayout({
  children,
  caseDetail,
  pivotObjects,
  dataModel,
  dataModelFeatureAccess,
}: CaseManagerPageLayoutProps) {
  const { t } = useTranslation(['cases']);
  const [sarReportModalOpen, setSarReportModalOpen] = useState(false);
  const [kycEnrichmentPanelOpen, setKycEnrichmentPanelOpen] = useState(false);
  const { info } = CommentContext.useValue();
  const sarReportsQuery = useSarReportsQuery(caseDetail.id);
  const getNextUnassignedCase = useServerFn(getNextUnassignedCaseFn);
  const router = useRouter();
  const nextUnassignedCaseHref = router.buildLocation({
    to: '/ressources/cases/next-unassigned/$caseId',
    params: { caseId: fromUUIDtoSUUID(caseDetail.id) },
  }).href;

  const handleSarAction = () => {
    setSarReportModalOpen(true);
  };
  const handleKycEnrichAction = () => {
    setKycEnrichmentPanelOpen(true);
  };

  const sarStatus = sarReportsQuery.data?.[0]?.status;
  const isSarCompleted = sarStatus === 'completed';
  const sarActionText = match(sarStatus)
    .with(undefined, () => t('cases:manager.actions.create_sar'))
    .with('pending', () => t('cases:manager.actions.complete_sar'))
    .with('completed', () => t('cases:manager.actions.sar_completed'))
    .exhaustive();

  return (
    <Page.Main>
      <Page.Header color="page" className="justify-between">
        <BreadCrumbs />
        <div className="flex gap-sm">
          {caseDetail.status !== 'closed' ? (
            <>
              <SnoozeCase caseId={caseDetail.id} snoozeUntil={caseDetail.snoozedUntil} />
              <CloseCase id={caseDetail.id} />
            </>
          ) : (
            <OpenCase id={caseDetail.id} />
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
        <Page.Content className="relative">
          <div className="flex justify-between mb-lg">
            <Tabs>
              <Link className={tabClassName} from="/cases/s/$caseId" to="./principal" preload="render">
                {t('cases:case_detail.tab.principal')}
              </Link>
              <Link
                disabled={!pivotObjects.length}
                className={tabClassName}
                from="/cases/s/$caseId"
                to="./clients"
                preload={pivotObjects.length ? 'render' : false}
              >
                {t('cases:manager.tab.clients_concerned')}
              </Link>
            </Tabs>
            <ActionBar>
              <ActionButton disabled={isSarCompleted} icon="plus" text={sarActionText} onClick={handleSarAction} />
              <ActionButton
                disabled={pivotObjects.length === 0}
                icon="plus"
                text={t('cases:manager.actions.enrich_kyc_profile')}
                onClick={handleKycEnrichAction}
              />
            </ActionBar>
          </div>
          <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
            {children}
          </DataModelContextProvider>
          <SarReportModal
            open={sarReportModalOpen}
            onOpenChange={setSarReportModalOpen}
            caseId={caseDetail.id}
            report={sarReportsQuery.data?.[0]}
          />
          <KycEnrichmentPanel
            caseId={caseDetail.id}
            open={kycEnrichmentPanelOpen}
            onOpenChange={setKycEnrichmentPanelOpen}
          />
          {info ? <StickyCommentForm {...info} /> : null}
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

type StickyCommentFormProps = {
  objectId: string;
  objectType: string;
};

function StickyCommentForm({ objectId, objectType }: StickyCommentFormProps) {
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId, true);

  return (
    <div className="sticky flex justify-end right-lg bottom-lg mt-lg">
      <ClientCommentForm annotationsQuery={annotationsQuery} objectId={objectId} objectType={objectType} />
    </div>
  );
}

type SarReportModalProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  caseId: string;
  report?: SuspiciousActivityReport;
};

function SarReportModal({ open, onOpenChange, caseId, report }: SarReportModalProps) {
  const { t } = useTranslation(['common', 'cases']);
  const editSuspicionMutation = useEditSuspicionMutation();
  const initialStatus = report?.status;
  const queryClient = useQueryClient();

  const { getRootProps, getInputProps, isDragActive } = useFormDropzone({
    multiple: false,
    onDrop: (acceptedFiles) => {
      form.setFieldValue('file', acceptedFiles[0]);
      form.validate('change');
    },
  });

  const form = useForm({
    onSubmit: ({ value }) => {
      editSuspicionMutation
        .mutateAsync(value)
        .then((res) => {
          if (!res.success) {
            toast.error(t('common:errors.unknown'));
            return;
          }
          onOpenChange(false);
          form.setFieldValue('reportId', res.data?.id);
          queryClient.invalidateQueries({ queryKey: ['sar-reports', caseId] });
        })
        .catch(() => {
          toast.error(t('common:errors.unknown'));
        });
    },
    defaultValues: {
      caseId: caseId,
      status: !initialStatus ? 'none' : 'completed',
      reportId: editSuspicionMutation.data?.data?.id ?? report?.id,
    } as EditSuspicionPayload,
    validators: {
      onSubmit: editSuspicionPayloadSchema,
    },
  });

  const reportFile = useStore(form.store, (state) => state.values.file);
  const newStatus = useStore(form.store, (state) => state.values.status);

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <div className="flex flex-col gap-md p-md">
          <Typo variant="title2">{t('cases:manager.sar_modal.title')}</Typo>
          <span>
            {initialStatus ? t('cases:sar.modale.callout_add_documents') : t('cases:sar.modale.callout_new_report')}
          </span>

          {!initialStatus ? (
            <form.Field name="status">
              {(field) => (
                <Radio.Root
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as SuspiciousActivityReportStatus)}
                  className="flex flex-col"
                >
                  <div className="flex gap-md px-md items-center h-9">
                    <Radio.Item value="pending" />
                    <span className="font-medium">{t('cases:manager.sar_modal.status_pending')}</span>
                  </div>
                  <div className="flex gap-md px-md items-center h-9">
                    <Radio.Item value="completed" />
                    <span className="font-medium">{t('cases:manager.sar_modal.status_completed')}</span>
                  </div>
                </Radio.Root>
              )}
            </form.Field>
          ) : null}

          {newStatus === 'completed' ? (
            <div
              {...getRootProps()}
              className={cn(
                'flex flex-col items-center justify-center gap-lg rounded-sm border-2 border-dashed p-lg',
                isDragActive ? 'bg-purple-background border-purple-disabled opacity-90' : 'border-grey-border',
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col gap-xs justify-center text-center">
                <div className="inline-flex gap-sm items-center">
                  <Icon icon="attachment" className="size-6 -rotate-45 text-grey-secondary" />
                  <span className="text-purple-primary font-medium">{t('cases:manager.sar_modal.add_documents')}</span>
                </div>
                <div className="text-tiny text-grey-secondary">{t('cases:drop_file_accepted_types')}</div>
              </div>
              {reportFile ? (
                <span className="border-grey-border flex items-center gap-xs rounded-sm border px-xs py-2xs text-xs font-medium">
                  {reportFile.name}
                  <Button
                    variant="secondary"
                    appearance="link"
                    mode="icon"
                    onClick={() => form.setFieldValue('file', undefined)}
                  >
                    <Icon icon="cross" className="text-grey-primary size-4" />
                  </Button>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton label={t('common:validate')} onClick={() => form.handleSubmit()} />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
