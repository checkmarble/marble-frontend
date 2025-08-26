import {
  SuspiciousActivityReport,
  SuspiciousActivityReportStatus,
  suspiciousActivityReportStatuses,
} from '@app-builder/models/cases';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { serialize } from 'object-to-formdata';
import { z } from 'zod/v4';

export type EditSuspicionResponse =
  | {
      success: true;
      errors: never[];
      data: SuspiciousActivityReport | undefined;
    }
  | {
      success: false;
      errors: string[];
      data?: undefined;
    };

export const editSuspicionPayloadSchema = z.object({
  status: z.union([
    ...(suspiciousActivityReportStatuses.map((s) => z.literal(s)) as [
      z.ZodLiteral<SuspiciousActivityReportStatus>,
      z.ZodLiteral<SuspiciousActivityReportStatus>,
      ...z.ZodLiteral<SuspiciousActivityReportStatus>[],
    ]),
    z.literal('none'),
  ]),
  file: z.instanceof(File).optional(),
  caseId: z.string(),
  reportId: z.string().optional(),
});

export type EditSuspicionPayload = z.infer<typeof editSuspicionPayloadSchema>;

const endpoint = getRoute('/ressources/cases/edit-suspicion');

export const useEditSuspicionMutation = () => {
  return useMutation({
    mutationKey: ['case', 'edit-suspicion'],
    mutationFn: async (payload: EditSuspicionPayload) => {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        body: serialize(payload),
      });
      return response.json() as Promise<EditSuspicionResponse>;
    },
  });
};
