import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptWebhook,
  adaptWebhookRegisterBodyDto,
  adaptWebhookUpdateBodyDto,
  adaptWebhookWithSecret,
  type Webhook,
  type WebhookCreateBody,
  type WebhookCreateSecretBody,
  type WebhookUpdateBody,
  type WebhookWithSecret,
} from '@app-builder/models/webhook';

export interface WebhookRepository {
  listWebhooks(): Promise<Webhook[]>;
  getWebhook(args: { webhookId: string }): Promise<WebhookWithSecret>;
  createWebhook(args: { webhookCreateBody: WebhookCreateBody }): Promise<WebhookWithSecret>;
  updateWebhook(args: { webhookId: string; webhookUpdateBody: WebhookUpdateBody }): Promise<Webhook>;
  deleteWebhook(args: { webhookId: string }): Promise<void>;
  createWebhookSecret(args: { webhookId: string; createSecretBody: WebhookCreateSecretBody }): Promise<void>;
  revokeWebhookSecret(args: { webhookId: string; secretId: string }): Promise<void>;
}

export function makeGetWebhookRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): WebhookRepository => ({
    listWebhooks: async () => {
      const { webhooks } = await marbleCoreApiClient.listWebhooks();

      return webhooks.map(adaptWebhook);
    },
    createWebhook: async ({ webhookCreateBody }) => {
      const { webhook } = await marbleCoreApiClient.createWebhook(adaptWebhookRegisterBodyDto(webhookCreateBody));

      return adaptWebhookWithSecret(webhook);
    },
    getWebhook: async ({ webhookId }) => {
      const { webhook } = await marbleCoreApiClient.getWebhook(webhookId);

      return adaptWebhookWithSecret(webhook);
    },
    updateWebhook: async ({ webhookId, webhookUpdateBody }) => {
      const { webhook } = await marbleCoreApiClient.updateWebhook(
        webhookId,
        adaptWebhookUpdateBodyDto(webhookUpdateBody),
      );

      return adaptWebhook(webhook);
    },
    deleteWebhook: async ({ webhookId }) => {
      await marbleCoreApiClient.deleteWebhook(webhookId);
    },
    createWebhookSecret: async ({ webhookId, createSecretBody }) => {
      await marbleCoreApiClient.createWebhookSecret(webhookId, {
        expire_existing_in_days: createSecretBody.expireExistingInDays,
      });
    },
    revokeWebhookSecret: async ({ webhookId, secretId }) => {
      await marbleCoreApiClient.revokeWebhookSecret(webhookId, secretId);
    },
  });
}
