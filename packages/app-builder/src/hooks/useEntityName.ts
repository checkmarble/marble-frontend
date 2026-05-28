import { scenarioI18n } from '@app-builder/components';
import { SearchableSchema } from '@app-builder/constants/screening-entity';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

export function useEntityName() {
  const { t } = useTranslation(scenarioI18n);

  function getEntityName(entityType?: SearchableSchema) {
    return match(entityType)
      .with('Thing', () => t('scenarios:edit_sanction.entity_type.thing'))
      .with('Person', () => t('scenarios:edit_sanction.entity_type.person'))
      .with('Organization', () => t('scenarios:edit_sanction.entity_type.organization'))
      .with('Vehicle', () => t('scenarios:edit_sanction.entity_type.vehicle'))
      .otherwise(() => entityType ?? 'Thing');
  }

  return { getEntityName, t };
}
