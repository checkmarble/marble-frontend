import { getServerEnv } from '@app-builder/utils/environment';
import { useSession } from '@tanstack/react-start/server';

type LngSessionData = {
  lng?: string;
};

export function useLngSession() {
  return useSession<LngSessionData>({
    name: 'lng',
    password: getServerEnv('SESSION_SECRET'),
    cookie: {
      sameSite: 'lax',
      httpOnly: true,
    },
  });
}
