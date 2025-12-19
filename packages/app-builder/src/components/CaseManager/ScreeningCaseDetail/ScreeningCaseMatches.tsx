import { PanelContainer, usePanel } from '@app-builder/components/Panel';
import { MatchDetails } from '@app-builder/components/Screenings/MatchDetails';
import { TopicTag } from '@app-builder/components/Screenings/TopicTag';
import { ContinuousScreening } from '@app-builder/models/continuous-screening';
import { match } from 'ts-pattern';
import { ButtonV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const ScreeningCaseMatches = ({ screening }: { screening: ContinuousScreening }) => {
  const { openPanel, closePanel } = usePanel();
  const handleRefineSearch = () => {
    openPanel(
      <PanelContainer size="xxxl" className="p-v2-xxxl">
        <Icon icon="left-panel-close" className="size-5 absolute inset-v2-md" onClick={closePanel} />
      </PanelContainer>,
    );
  };

  return (
    <div className="flex flex-col gap-v2-sm">
      <div className="flex items-center justify-between gap-v2-sm">
        <div className="text-h2 font-semibold">Matches found</div>
        <ButtonV2 variant="secondary" className="ml-auto">
          Dismiss alert
        </ButtonV2>
        <ButtonV2 variant="secondary" onClick={() => handleRefineSearch()}>
          Refine search
        </ButtonV2>
        <ButtonV2 variant="secondary">Tout valider</ButtonV2>
      </div>
      <div className="grid grid-cols-[1fr_calc(var(--spacing)_*_52)] border border-grey-border rounded-v2-md bg-white">
        <div className="grid grid-cols-subgrid col-span-full border-b border-grey-border text-tiny text-grey-50">
          <div className="p-v2-sm">Correspondance</div>
          <div className="p-v2-sm">Statut</div>
        </div>
        {screening.matches.map((screeningMatch) => {
          return (
            <div className="grid grid-cols-subgrid col-span-full not-last:border-b not-last:border-grey-border">
              <div className="border-r border-grey-border p-v2-md flex flex-col gap-v2-sm">
                <div className="flex items-center gap-v2-sm">
                  <span className="font-medium">{screeningMatch.payload.caption}</span>
                  <span className="text-small text-grey-50">{screeningMatch.payload.schema}</span>
                  <Tag color="grey" className="shrink-0">
                    Correspondance {screeningMatch.payload.score * 100}%
                  </Tag>
                  {screeningMatch.payload.properties['topics']?.map((topic) => {
                    return <TopicTag key={topic} topic={topic} />;
                  })}
                </div>
                <div className="p-v2-sm bg-grey-background-light rounded-v2-md">
                  <MatchDetails entity={screeningMatch.payload} />
                </div>
              </div>
              <div className="p-v2-sm">
                {match(screeningMatch.status)
                  .with('confirmed_hit', () => <Tag color="green">Correspondance</Tag>)
                  .with('no_hit', () => <Tag color="red">Pas de correspondance</Tag>)
                  .with('pending', () => (
                    <div className="px-v2-sm py-v2-xs bg-orange-50 rounded-v2-md text-white inline-flex items-center">
                      <span>À examiner</span>
                      <Icon icon="caret-down" className="size-4" />
                    </div>
                  ))
                  .with('skipped', () => <Tag color="grey">Non correspondant</Tag>)
                  .exhaustive()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
