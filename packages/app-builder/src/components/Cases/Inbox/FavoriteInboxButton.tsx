import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { setPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookies-write';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface FavoriteInboxButtonProps {
  inboxId: string;
  isFavorite: boolean;
  onToggle: (newFavoriteId: string | undefined) => void;
}

export const FavoriteInboxButton: FunctionComponent<FavoriteInboxButtonProps> = ({ inboxId, isFavorite, onToggle }) => {
  const { t } = useTranslation(['cases']);

  const handleClick = () => {
    if (isFavorite) {
      setPreferencesCookie('favInbox', '');
      onToggle(undefined);
    } else {
      const inboxIdToStore = inboxId === MY_INBOX_ID ? inboxId : fromUUIDtoSUUID(inboxId);
      setPreferencesCookie('favInbox', inboxIdToStore);
      onToggle(inboxIdToStore);
    }
  };

  return (
    <ButtonV2
      variant={isFavorite ? 'primary' : 'secondary'}
      appearance="stroked"
      size="default"
      onClick={handleClick}
      title={isFavorite ? t('cases:inbox.remove_favorite') : t('cases:inbox.set_as_favorite')}
    >
      {t('cases:inbox.favorite')}
      <Icon
        icon="star"
        className={isFavorite ? 'size-5 fill-purple-65 text-purple-65' : 'size-5 fill-transparent text-grey-50'}
      />
    </ButtonV2>
  );
};
