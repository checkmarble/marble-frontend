import { isTracfinRequestError } from '@app-builder/models/tracfin';
import { useTracfinCreateDraftMutation } from '@app-builder/queries/tracfin/create-draft';
import { tracfinKeys } from '@app-builder/queries/tracfin/keys';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Radio, Typo } from 'ui-design-system';
import { ErrorBanner } from '../Settings/ErrorBanner';

type Choice = 'yes' | 'no' | '';

/**
 * The case has no draft yet. One question, answered explicitly (no default: `false` is a choice, not
 * the absence of one), then the draft is created from the organisation configuration.
 */
export function CreateDraftPanel({ caseId }: { caseId: string }) {
  const { t } = useTranslation(['tracfin']);
  const queryClient = useQueryClient();
  const createDraft = useTracfinCreateDraftMutation(caseId);
  const [choice, setChoice] = useState<Choice>('');
  const [failure, setFailure] = useState<{ kind: 'outcome' | 'other'; message: string | null } | null>(null);

  const caseLink = (
    <Link to="/cases/$caseId" params={{ caseId: fromUUIDtoSUUID(caseId) }} className="text-purple-primary underline">
      {t('tracfin:draft.create.back_to_case')}
    </Link>
  );

  const submit = async () => {
    if (choice === '') return;
    setFailure(null);
    try {
      await createDraft.mutateAsync({ declarant_is_actor: choice === 'yes' });
    } catch (error) {
      if (isTracfinRequestError(error) && error.error.kind === 'conflict') {
        // Someone created the draft meanwhile: open that one.
        await queryClient.invalidateQueries({ queryKey: tracfinKeys.draft(caseId) });
        return;
      }
      if (isTracfinRequestError(error) && error.error.kind === 'bad_request') {
        setFailure({ kind: 'outcome', message: error.error.message });
        return;
      }
      setFailure({ kind: 'other', message: error instanceof Error ? error.message : null });
    }
  };

  return (
    <section
      aria-labelledby="tracfin-create-title"
      className="border-grey-border bg-surface-card flex max-w-(--breakpoint-md) flex-col gap-md rounded-lg border p-lg"
    >
      <Typo as="h1" variant="title1" id="tracfin-create-title">
        {t('tracfin:draft.title')}
      </Typo>
      <p className="text-s text-grey-secondary">{t('tracfin:draft.create.explanation')}</p>

      <fieldset className="flex flex-col gap-sm">
        <legend className="text-default mb-xs font-medium">{t('tracfin:draft.create.question')}</legend>
        <Radio.Root
          value={choice}
          onValueChange={(value) => setChoice(value as Choice)}
          aria-label={t('tracfin:draft.create.question')}
        >
          <Radio.Item value="yes">
            <span className="text-s">{t('tracfin:draft.create.yes')}</span>
          </Radio.Item>
          <Radio.Item value="no">
            <span className="text-s">{t('tracfin:draft.create.no')}</span>
          </Radio.Item>
        </Radio.Root>
        <p className="text-grey-secondary text-xs">{t('tracfin:draft.create.declarant_help')}</p>
      </fieldset>

      {failure ? (
        <ErrorBanner>
          <p className="font-semibold">
            {failure.kind === 'outcome' ? t('tracfin:draft.create.refused') : t('tracfin:draft.create.failed')}
          </p>
          {failure.kind === 'outcome' ? <p>{t('tracfin:draft.create.outcome_required')}</p> : null}
          {failure.message ? <p className="font-mono text-xs">{failure.message}</p> : null}
          {failure.kind === 'outcome' ? <p>{caseLink}</p> : null}
        </ErrorBanner>
      ) : null}

      <div className="flex items-center gap-md">
        <Button variant="primary" disabled={choice === '' || createDraft.isPending} onClick={submit}>
          {t('tracfin:draft.create.submit')}
        </Button>
        {caseLink}
      </div>
    </section>
  );
}
