import { type QualificationLevel, qualificationLevels } from '@app-builder/models/cases';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';

type QualificationLevelFilterMenuItemProps = {
  onSelect: (level: QualificationLevel) => void;
};

export const QualificationLevelFilterMenuItem = ({ onSelect }: QualificationLevelFilterMenuItemProps) => {
  return (
    <MenuCommand.List>
      {qualificationLevels.map((level) => (
        <MenuCommand.Item key={level} value={level} onSelect={() => onSelect(level)}>
          <QualificationLevelLabel level={level} />
        </MenuCommand.Item>
      ))}
    </MenuCommand.List>
  );
};

export const QualificationLevelLabel = ({ level }: { level: QualificationLevel }) => {
  const { t } = useTranslation(['cases']);

  const label = t(`cases:filter.qualification_level.${level}`);
  const colorClass =
    level === 'green' ? 'text-green-primary' : level === 'orange' ? 'text-orange-primary' : 'text-red-primary';

  return <span className={colorClass}>{label}</span>;
};
