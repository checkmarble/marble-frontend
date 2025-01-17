import { fakeSanctionCheck } from '@app-builder/utils/faker/case-sanction';
import { parseWithZod } from '@conform-to/zod';
import { faker } from '@faker-js/faker';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod';

const schema = z.object({
  sanctionMatchId: z.string(),
  status: z.union([z.literal('confirmed_hit'), z.literal('no_hit')]),
  comment: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  // const {
  //   authService,
  //   toastSessionService: { getSession, commitSession },
  // } = serverServices;
  // const session = await getSession(request);

  // const { cases } = await authService.isAuthenticated(request, {
  //   failureRedirect: getRoute('/sign-in'),
  // });

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status === 'success') {
    fakeSanctionCheck.matches = fakeSanctionCheck.matches.map((m) => {
      if (m.id !== submission.value.sanctionMatchId) {
        return m;
      }
      return {
        ...m,
        status: submission.value.status,
        comments: [
          ...m.comments,
          ...(submission.value.comment
            ? [
                {
                  id: faker.string.uuid(),
                  comment: submission.value.comment,
                  createdAt: new Date().toISOString(),
                  sanctionCheckMatchId: m.id,
                },
              ]
            : []),
        ],
      };
    });

    return { ok: true };
  }

  return null;

  // if (submission.status !== 'success') {
  //   return json(submission.reply());
  // }

  // try {
  //   await cases.addComment({
  //     caseId: submission.value.caseId,
  //     body: { comment: submission.value.comment },
  //   });

  //   setToastMessage(session, {
  //     type: 'success',
  //     messageKey: 'common:success.save',
  //   });

  //   return json(submission.reply({ resetForm: true }), {
  //     headers: { 'Set-Cookie': await commitSession(session) },
  //   });
  // } catch (error) {
  //   setToastMessage(session, {
  //     type: 'error',
  //     messageKey: 'common:errors.unknown',
  //   });

  //   return json(submission, {
  //     headers: { 'Set-Cookie': await commitSession(session) },
  //   });
  // }
}
