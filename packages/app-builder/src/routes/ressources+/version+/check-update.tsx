import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';

export type VersionUpdateResource = {
  needsUpdate: boolean;
  version: string;
  releaseNotes: string;
  releaseUrl: string;
};

// Mock implementation - to be replaced with actual backend call
const MOCK_ENABLED = true;

const mockReleaseNotes = `## Features

[infrastructure] Decision rule offloading: automatically offload voluminous decision execution details to a bucket, to keep the database instance size smaller. See more about this in installation/data_offloading.md or [here](https://docs.checkmarble.com/docs/data-offloading#/).
- New \`workflow_status\` field available in the API response

### API Changes

- Added new endpoint \`GET /api/v1/analytics/summary\` for dashboard data
- The \`decision_id\` parameter is now required in screening endpoints

## Improvements

- Allow to pass a single IP address (not a range) for IP whitelisting
- Allow to open cases (and all other table rows as links) in a new tab with cmd/ctrl+click
- Search case by case_id, filter them by assignee, and make full text search much more relevant in the inbox page
- Set default pagination size to 50 elements, allow to increase it up to 100 and increase case results box size in inbox page
- Faster AI case review generation time

### Performance

- Optimized database queries for case listing (up to 3x faster)
- Reduced memory usage in rule evaluation engine

## Bug fixes

- Fix a situation where the case manager page would fail to load on cases that contain many decisions - also, improve loading speed for the case manager main mage in all situations
- Correct a situation where several decisions related to the same customer, created at the same time, could open several cases even if the workflow is configured to group them into one case
- Add fields nationality (for Person) or country (for Organization) to the POST /screening/:screeningId/search and POST /screening/:screeningId/refine endpoints (was already handled by the endpoint but not documented)

### Known Issues

> Some users may experience slower initial load times after upgrading. This will resolve after the first data sync completes.

---

## Migration Notes

To upgrade, run:

\`\`\`bash
docker pull checkmarble/marble-backend:v0.52.0
docker-compose up -d
\`\`\`

> **Important:** Make sure to backup your database before upgrading.`;

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function checkUpdate({ context: _context }) {
    if (MOCK_ENABLED) {
      return {
        needsUpdate: true,
        version: '0.52.0',
        releaseNotes: mockReleaseNotes,
        releaseUrl: 'https://github.com/checkmarble/marble-backend/releases/tag/v0.52.0',
      } satisfies VersionUpdateResource;
    }

    // Future: Real backend call
    // const updateInfo = await _context.authInfo.version.checkForUpdates();
    // return updateInfo;

    return {
      needsUpdate: false,
      version: '',
      releaseNotes: '',
      releaseUrl: '',
    } satisfies VersionUpdateResource;
  },
);
