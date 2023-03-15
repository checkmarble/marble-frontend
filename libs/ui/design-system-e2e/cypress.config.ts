import { nxE2EStorybookPreset } from '@nrwl/storybook/presets/cypress';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EStorybookPreset(__dirname),
    /**
     * TODO(@nrwl/cypress): In Cypress v12,the testIsolation option is turned on by default.
     * This can cause tests to start breaking where not indended.
     * You should consider enabling this once you verify tests do not depend on each other
     * More Info: https://docs.cypress.io/guides/references/migration-guide#Test-Isolation
     **/
    testIsolation: false,
  },
});
