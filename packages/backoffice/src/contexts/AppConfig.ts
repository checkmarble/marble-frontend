import { createSimpleContext } from '@marble/shared';
import { AppConfigDto } from 'marble-api';

export const AppConfigContext = createSimpleContext<AppConfigDto>('AppConfig');
