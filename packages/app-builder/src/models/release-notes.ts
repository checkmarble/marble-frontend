import { type AppConfigDto } from 'marble-api';

export type ReleaseNotes = {
  versions: {
    apiVersion: string;
    appVersion: string;
  };
  outdated: {
    isOutdated: boolean;
    latestVersion?: string;
    latestUrl?: string;
    releaseNotes?: string[];
  };
};

export function adaptReleaseNotes(dto: AppConfigDto, appVersion: string): ReleaseNotes {
  return {
    versions: {
      apiVersion: dto.version,
      appVersion,
    },
    outdated: {
      isOutdated: dto.outdated.outdated,
      latestVersion: dto.outdated.latest_version,
      latestUrl: dto.outdated.latest_url,
      releaseNotes: dto.outdated.release_notes,
    },
  };
}
