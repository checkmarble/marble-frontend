import { type ToastMessage, toastMessageSchema } from '@app-builder/models/toast-session';
import { getServerEnv } from '@app-builder/utils/environment';
import { useSession } from '@tanstack/react-start/server';

type ToastSessionData = {
  toastMessage?: ToastMessage;
};

function useToastSession() {
  return useSession<ToastSessionData>({
    name: 'toast',
    password: getServerEnv('SESSION_SECRET'),
    cookie: {
      sameSite: 'lax',
      httpOnly: true,
    },
  });
}

export async function setToast(message: ToastMessage): Promise<void> {
  const session = await useToastSession();
  await session.update({ toastMessage: message });
}

export async function getToast(): Promise<ToastMessage | undefined> {
  const session = await useToastSession();
  const raw = session.data.toastMessage;
  if (raw === undefined) return undefined;
  await session.update({ toastMessage: undefined });
  const parsed = toastMessageSchema.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}
