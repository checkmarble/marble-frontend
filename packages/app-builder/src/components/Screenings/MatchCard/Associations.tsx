import { StringCodeComponent } from '@app-builder/components/Data/DataVisualisation/DataField';
import { IconDot } from '@app-builder/components/Screenings/MatchCard/match-card-entity-components';
import { AssociationEntity } from '@app-builder/models/screening';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, ExpandableGroupTagLine } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { getFilteredAndSortedTopics } from '../TopicsDisplay';
import { isDisplayableTopic, TopicTag } from '../TopicTag';
import ModalPerson from './ModalPerson';
import { cleanUrl, getPersonName, hasDisplayableName } from './match-card-utility-functions';

const MAX_ASSOCIATIONS = 5;

export type AssociationRow = {
  key: string;
  association: AssociationEntity;
  id: string;
  properties: NonNullable<AssociationEntity['properties']['person']>[number]['properties'];
};

function flattenAssociations(associations: AssociationEntity[]): AssociationRow[] {
  const rows: AssociationRow[] = [];

  associations.forEach((association, associationIndex) => {
    association.properties.person?.forEach((person, idx) => {
      if (!person.properties || !hasDisplayableName(person.properties)) return;
      rows.push({
        key: `person-${associationIndex}-${person.id}-${idx}`,
        association,
        id: person.id,
        properties: person.properties,
      });
    });
  });

  return rows;
}

export const Associations = ({ associations }: { associations: AssociationEntity[] | undefined }) => {
  const { t } = useTranslation(['screenings', 'common']);
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => (associations ? flattenAssociations(associations) : []), [associations]);
  const hiddenCount = Math.max(0, rows.length - MAX_ASSOCIATIONS);
  const visibleRows = showAll ? rows : rows.slice(0, MAX_ASSOCIATIONS);

  if (rows.length === 0) return null;

  return (
    <ul className="grid grid-cols-[146px_1fr] gap-2">
      {visibleRows.map((row, rowIndex) => {
        const { key, association, id, properties } = row;
        const isFirstElement = rowIndex === 0;

        const rel = association.properties.relationship?.map((relation: string) =>
          t(`screenings:relation.${R.toCamelCase(relation)}.label`, {
            defaultValue: relation,
          }),
        );

        const tags = properties.topics?.length
          ? getFilteredAndSortedTopics(properties.topics)
              .filter(isDisplayableTopic)
              .map((topic: string) => <TopicTag key={`${id}-${topic}`} topic={topic} />)
          : [];

        const expandableItems = [
          <IconDot key="dot-1" dark spaced />,
          properties.caption?.length > 0 ? (
            <span key="caption" className="text-sm text-grey-70 shrink-0 font-medium">
              {properties.caption}
            </span>
          ) : (
            <span key="alias" className="shrink-0">
              {getPersonName(row)}
            </span>
          ),
          <IconDot key="dot-2" />,
          rel?.length ? (
            <StringCodeComponent key="rel">
              {rel?.map((r, index) => (
                <span key={r}>
                  {r}
                  {index < rel.length - 1 ? <IconDot spaced /> : null}
                </span>
              ))}
            </StringCodeComponent>
          ) : (
            <StringCodeComponent key="rel" value={t('screenings:match.family.unknown_relationship')} />
          ),
          <IconDot key="dot-3" />,
          ...tags,
        ];

        return (
          <li key={key} className="contents">
            <div className="font-semibold">
              {isFirstElement && <div className="font-bold mb-2">{t('screenings:match.associations.title')}</div>}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-v2-sm">
                <ExpandableGroupTagLine items={expandableItems} classname="gap-v2-sm" overflowTagWidth={60} />
                <ModalPerson personId={id} personName={getPersonName(row)} />
              </div>

              {association.properties.sourceUrl && association.properties.sourceUrl.length > 0 && (
                <span className="col-span-full flex w-full flex-col gap-1">
                  <div className="font-semibold">{t('screenings:match.family.source.label')}</div>
                  <ul className="list-inside pl-2">
                    {association.properties.sourceUrl.map((url, urlIdx) => (
                      <li key={`source-${id}-${urlIdx}`} className="flex items-center gap-v2-xs">
                        <Icon icon="external-link" className="size-4 shrink-0" />
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-primary hover:text-purple-75 underline"
                        >
                          {cleanUrl(url)}
                        </a>
                        {urlIdx < association.properties.sourceUrl!.length - 1 ? <IconDot spaced /> : null}
                      </li>
                    ))}
                  </ul>
                </span>
              )}
            </div>
          </li>
        );
      })}
      {hiddenCount > 0 && !showAll && (
        <li className="contents">
          <span />
          <Button appearance="link" variant="primary" onClick={() => setShowAll(true)}>
            {t('common:more_remains', { count: hiddenCount })}
          </Button>
        </li>
      )}
    </ul>
  );
};
