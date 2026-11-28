import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptWebhook, type Webhook } from '@app-builder/models/webhook';

export async function listWebhooks(api: MarbleCoreApi): Promise<Webhook[]> {
  const { webhooks } = await api.listWebhooks();

  return webhooks.map(adaptWebhook);
}
