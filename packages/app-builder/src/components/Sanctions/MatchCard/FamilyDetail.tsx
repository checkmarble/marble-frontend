import { FamilyPersonEntity } from '@app-builder/models/sanction-check';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { sanctionsI18n } from '../sanctions-i18n';
import { TopicTag } from '../TopicTag';

export const FamilyDetail = ({ familyMembers }: { familyMembers: FamilyPersonEntity[] }) => {
  const language = useFormatLanguage();

  const { t } = useTranslation(sanctionsI18n);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyPersonEntity | null>(null);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className="grid grid-cols-[168px,_1fr] gap-2">
        <div className="font-bold col-span-2">{t('sanctions:match.family-members.title')}</div>

        {familyMembers.map((member) => {
          // { properties: { relationship, relative, startDate, endDate } }
          return member.properties.relative?.map(({ id, properties }, idx) => {
            // if (status === 'dead') return null;
            if (!properties.name?.[0]) return null;
            const rel =
              member.properties.relationship?.join(' · ') ??
              t('sanctions:match.family.unknown_relationship');
            return (
              <div key={`person-${id}-${idx}`} className="contents">
                <div className="font-semibold">{rel}:</div>
                <div className="flex flex-row items-start  gap-2 rounded p-2 bg-grey-100">
                  <div className="flex flex-col items-start  gap-2">
                    <div className="col-span-full flex w-full flex-wrap gap-1">
                      <span>
                        {properties.firstName?.slice(0, 3).join(' ')}{' '}
                        {properties['secondName']?.[0]}
                      </span>
                      <span className="font-semibold">
                        {properties.lastName?.slice(0, 3).join(' ') ?? 'unknown'}
                      </span>
                    </div>
                    <div className="col-span-full flex w-full flex-wrap gap-1">
                      {properties['topics']?.map((topic) => (
                        <TopicTag key={`${id}-${topic}`} topic={topic} />
                      ))}
                    </div>
                    {member.properties.startDate?.[0] || member.properties.endDate?.[0] ? (
                      <div className="col-span-full flex w-full flex-wrap gap-1">
                        {member.properties.startDate?.[0] && (
                          <span>
                            {formatDateTimeWithoutPresets(member.properties.startDate[0], {
                              language,
                              dateStyle: 'short',
                            })}
                          </span>
                        )}
                        {member.properties.startDate?.[0] && member.properties.endDate?.[0] ? (
                          <span> - </span>
                        ) : null}
                        {member.properties.endDate?.[0] && (
                          <span>
                            {formatDateTimeWithoutPresets(member.properties.endDate[0], {
                              language,
                              dateStyle: 'short',
                            })}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex justify-end items-end">
                    <Modal.Trigger>
                      <Button variant="ghost" onClick={() => setSelectedMember(member)}>
                        <Icon
                          icon="visibility-on"
                          className="text-grey-90 hover:text-purple-65 size-5 cursor-pointer"
                        />
                      </Button>
                    </Modal.Trigger>
                  </div>
                </div>
              </div>
            );
          });
        })}
      </div>
      <Modal.Content size="large" className="max-h-[80vh]">
        <div className="relative">
          <Modal.Title>{t('sanctions:match.family-member.title')}</Modal.Title>
          <Modal.Close asChild>
            <Button variant="ghost" className="absolute top-2 right-2">
              <Icon icon="cross" className="size-6" />
            </Button>
          </Modal.Close>
        </div>
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-[168px,_1fr] gap-2">
            {selectedMember?.properties?.relative?.map((person) => {
              console.log(person);
              return null;
              //   return (
              //     <Fragment key={person.id}>
              //       <span className="font-bold">
              //         {t(`sanctions:entity.property.${property}`, {
              //           defaultValue: property,
              //         })}
              //       </span>
              //       <span className="break-all">
              //         {values.length > 0 ? (
              //           <>
              //             {values.map((v, i) => (
              //               <Fragment key={i}>
              //                 <TransformProperty property={property} value={v} />
              //                 {i === values.length - 1 ? null : <span className="mx-1">·</span>}
              //               </Fragment>
              //             ))}
              //             {restItemsCount > 0 ? (
              //               <>
              //                 <span className="mx-1">·</span>
              //                 <button
              //                   onClick={(e) => {
              //                     e.preventDefault();
              //                     handleShowMore(property);
              //                   }}
              //                   className="text-purple-65 font-semibold"
              //                 >
              //                   + {restItemsCount} more
              //                 </button>
              //               </>
              //             ) : null}
              //           </>
              //         ) : (
              //           <span className="text-grey-50">not available</span>
              //         )}
              //       </span>
              //     </Fragment>
              //   );
            })}
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};
