import { ExternalLink } from '@app-builder/components/ExternalLink';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { Icon } from 'ui-icons';

export function TimestampExtractTimezoneLink() {
  const { org } = useOrganizationDetails();

  return (
    <ExternalLink href="/settings/scenarios" className="flex flex-nowrap items-center gap-xs normal-case">
      {org.defaultScenarioTimezone ?? 'UTC'} <Icon icon="external-link" className="size-4" />
    </ExternalLink>
  );
}
