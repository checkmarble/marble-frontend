import { type AppConfig } from '@app-builder/models/app-config';
import { createSimpleContext } from '@marble/shared';

export const AppConfigContext = createSimpleContext<AppConfig>('AppConfig');
