import { CalloutV2 } from '@app-builder/components/Callout';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Tag } from 'ui-design-system';
import { ErrorBanner } from '../../Settings/ErrorBanner';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { DiagnosticNotice } from './DiagnosticNotice';
import { PrefillBlockCard } from './PrefillBlockCard';
import { cleanChoices, scopeGroups } from './prefill-model';
import { useTracfinPrefill } from './TracfinPrefillContext';

function Notices() {
  const { t } = useTranslation(['tracfin']);
  const { notice } = useTracfinPrefill();
  if (!notice) return null;
  switch (notice.kind) {
    case 'applied':
      return (
        <CalloutV2 role="status">
          <p className="text-s">{t('tracfin:draft.prefill.notice.applied', { count: notice.count })}</p>
        </CalloutV2>
      );
    case 'refused':
      return (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:draft.prefill.notice.refused')}</p>
          {notice.message ? <p className="font-mono text-xs">{notice.message}</p> : null}
        </ErrorBanner>
      );
    case 'moved':
      return (
        <ErrorBanner>
          <p>{t('tracfin:draft.prefill.notice.moved')}</p>
        </ErrorBanner>
      );
    case 'save_failed':
      return (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:draft.prefill.notice.save_failed')}</p>
          {notice.message ? <p className="font-mono text-xs">{notice.message}</p> : null}
        </ErrorBanner>
      );
    case 'failed':
      return (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:draft.prefill.notice.failed')}</p>
          {notice.message ? <p className="font-mono text-xs">{notice.message}</p> : null}
        </ErrorBanner>
      );
  }
}

function Body() {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  const prefill = useTracfinPrefill();
  const { availability, result, groups, stale, status, scope } = prefill;

  if (availability !== 'available') {
    return (
      <CalloutV2 role="note">
        <div className="flex flex-col gap-xs">
          <p className="text-s font-medium">{t(`tracfin:draft.prefill.unavailable.${availability}.title`)}</p>
          <p className="text-s">{t(`tracfin:draft.prefill.unavailable.${availability}.description`)}</p>
        </div>
      </CalloutV2>
    );
  }

  const visible = groups ? scopeGroups(groups, scope) : null;
  return (
    <>
      {status === 'running' ? (
        <p role="status" className="text-s text-grey-secondary">
          {t('tracfin:draft.prefill.running')}
        </p>
      ) : null}
      {status === 'applying' ? (
        <p role="status" className="text-s text-grey-secondary">
          {t('tracfin:draft.prefill.applying')}
        </p>
      ) : null}
      <Notices />
      {result && stale ? (
        <div role="alert" className="border-orange-border flex flex-wrap items-center gap-sm rounded-md border p-sm">
          <Tag size="xs" color="orange">
            {t('tracfin:draft.prefill.stale_tag')}
          </Tag>
          <p className="text-s min-w-0 flex-1">
            {t('tracfin:draft.prefill.stale_description', { current: draft.revision, computed: result.draftRevision })}
          </p>
          <Button variant="primary" size="small" disabled={status !== 'idle'} onClick={() => void prefill.run()}>
            {t('tracfin:draft.prefill.recompute')}
          </Button>
        </div>
      ) : null}
      {result && visible ? (
        <>
          <p className="text-grey-secondary text-xs">
            {t('tracfin:draft.prefill.computed_on', {
              revision: result.draftRevision,
              version: result.mappingVersion.slice(0, 12),
            })}
          </p>
          <div
            className="flex flex-wrap items-center gap-xs"
            aria-label={t('tracfin:draft.prefill.counts_label')}
            role="group"
          >
            <Tag size="small" color="green">
              {t('tracfin:draft.prefill.count.clean', { count: visible.counts.clean })}
            </Tag>
            <Tag size="small" color="orange">
              {t('tracfin:draft.prefill.count.conflicts', { count: visible.counts.conflicts })}
            </Tag>
            <Tag size="small" color="grey">
              {t('tracfin:draft.prefill.count.diagnostics', { count: visible.counts.diagnostics })}
            </Tag>
          </div>
          {scope !== null ? (
            <div className="flex flex-wrap items-center gap-sm">
              <p className="text-s text-grey-secondary">
                {t('tracfin:draft.prefill.scope', { section: t(`tracfin:draft.sections.${scope}`) })}
              </p>
              <Button variant="secondary" appearance="link" onClick={() => prefill.openPanel(null)}>
                {t('tracfin:draft.prefill.show_all')}
              </Button>
            </div>
          ) : null}
          {visible.sections.length === 0 && visible.general.length === 0 ? (
            <p className="text-s text-grey-secondary">{t('tracfin:draft.prefill.nothing')}</p>
          ) : null}
          {visible.sections.map((entry) => (
            <section
              key={entry.section}
              aria-label={t(`tracfin:draft.sections.${entry.section}`)}
              className="flex flex-col gap-sm"
            >
              <h3 className="text-default font-semibold">{t(`tracfin:draft.sections.${entry.section}`)}</h3>
              {entry.blocks.map((group) => (
                <PrefillBlockCard key={group.blockId} group={group} />
              ))}
            </section>
          ))}
          {visible.general.length > 0 ? (
            <section aria-label={t('tracfin:draft.prefill.general')} className="flex flex-col gap-sm">
              <h3 className="text-default font-semibold">{t('tracfin:draft.prefill.general')}</h3>
              {visible.general.map((diagnostic, index) => (
                <DiagnosticNotice key={`${diagnostic.code}-${index}`} diagnostic={{ ...diagnostic, stale }} />
              ))}
            </section>
          ) : null}
        </>
      ) : null}
    </>
  );
}

/**
 * The prefill review: proposals of the saved draft by section then block, the non-conflicting ones
 * applied in one batch, the conflicts decided side by side, the diagnostics explained. Nothing is
 * written until the analyst applies something.
 */
export function PrefillPanel() {
  const { t } = useTranslation(['tracfin']);
  const prefill = useTracfinPrefill();
  const visible = prefill.groups ? scopeGroups(prefill.groups, prefill.scope) : null;
  const choices = visible ? cleanChoices(visible, prefill.excluded) : [];
  const canApply = !prefill.stale && prefill.status === 'idle' && choices.length > 0;

  return (
    <Modal.Root
      open={prefill.open}
      onOpenChange={(open) => (open ? prefill.openPanel(prefill.scope) : prefill.closePanel())}
    >
      <Modal.Content size="large">
        <Modal.Title>{t('tracfin:draft.prefill.title')}</Modal.Title>
        <Modal.Description className="text-grey-secondary text-s px-md">
          {t('tracfin:draft.prefill.intro')}
        </Modal.Description>
        <div className="flex min-w-0 flex-col gap-md p-md">
          <Body />
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('tracfin:draft.prefill.close')} />
          {prefill.availability === 'available' ? (
            <Modal.FooterButton
              label={t('tracfin:draft.prefill.apply_clean', { count: choices.length })}
              disabled={!canApply}
              isLoading={prefill.status === 'applying'}
              onClick={() => void prefill.apply(choices)}
            />
          ) : null}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
