import { OrganizationChangeContext } from '@app-builder/contexts/OrganizationChangeContext';
import type { Organization, UserOrganization } from '@app-builder/models/organization';
import { useChangeOrganizationIdMutation } from '@app-builder/queries/auth/new-organization-id';
import { getSessionOrganizationIdFn } from '@app-builder/server-fns/auth';
import { useClientServices } from '@app-builder/services/init-client';
import { useCsrfToken } from '@app-builder/utils/csrf-client';
import { withOrganizationChangeLock } from '@app-builder/utils/organization-change-lock';
import { focusManager, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { z } from 'zod/v4';
import { OrganizationChangeModal, type OrganizationChangeModalPhase } from './OrganizationChangeModal';

const CHANNEL_NAME = 'marble:organization-change';
const RECOVERY_TIMEOUT_MS = 10_000;

const organizationChangeMessageSchema = z.object({
  status: z.enum(['started', 'committed', 'cancelled']),
  transitionId: z.string(),
  sourceTabId: z.string(),
  fromOrganizationId: z.string(),
  toOrganizationId: z.string(),
  startedAt: z.number(),
});

type OrganizationChangeMessage = z.infer<typeof organizationChangeMessageSchema>;
type OrganizationTransition = Omit<OrganizationChangeMessage, 'status'>;

interface OrganizationTransitionState extends OrganizationTransition {
  phase: OrganizationChangeModalPhase;
  silent?: boolean;
}

interface OrganizationChangeProviderProps {
  children: React.ReactNode;
  currentOrganization: Organization;
  organizations: UserOrganization[];
}

function supportsBroadcastChannel() {
  return typeof window !== 'undefined' && 'BroadcastChannel' in window;
}

export function OrganizationChangeProvider({
  children,
  currentOrganization,
  organizations,
}: OrganizationChangeProviderProps) {
  const { t } = useTranslation('navigation');
  const router = useRouter();
  const queryClient = useQueryClient();
  const csrf = useCsrfToken();
  const getSessionOrganizationId = useServerFn(getSessionOrganizationIdFn);
  const changeOrganizationIdMutation = useChangeOrganizationIdMutation();
  const clientServices = useClientServices();
  const [transition, setTransition] = useState<OrganizationTransitionState | null>(null);
  const transitionRef = useRef<OrganizationTransitionState | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const tabIdRef = useRef<string | null>(null);

  const setCurrentTransition = useCallback((nextTransition: OrganizationTransitionState | null) => {
    transitionRef.current = nextTransition;
    setTransition(nextTransition);
  }, []);

  const revealCurrentTransition = useCallback(() => {
    const activeTransition = transitionRef.current;
    if (!activeTransition) return false;
    setCurrentTransition({ ...activeTransition, phase: 'decision', silent: false });
    return true;
  }, [setCurrentTransition]);

  const getTabId = useCallback(() => {
    tabIdRef.current ??= crypto.randomUUID();
    return tabIdRef.current;
  }, []);

  const createTransition = useCallback(
    (fromOrganizationId: string, toOrganizationId: string): OrganizationTransition => ({
      transitionId: crypto.randomUUID(),
      sourceTabId: getTabId(),
      fromOrganizationId,
      toOrganizationId,
      startedAt: Date.now(),
    }),
    [getTabId],
  );

  const broadcast = useCallback((status: OrganizationChangeMessage['status'], value: OrganizationTransition) => {
    channelRef.current?.postMessage({ ...value, status } satisfies OrganizationChangeMessage);
  }, []);

  const fetchSessionOrganizationId = useCallback(async () => {
    const result = await getSessionOrganizationId();
    return result.organizationId;
  }, [getSessionOrganizationId]);

  const reconcileWithSessionOrganization = useCallback(
    (organizationId: string) => {
      if (organizationId === currentOrganization.id) {
        setCurrentTransition(null);
        return;
      }

      const activeTransition = transitionRef.current;
      const reconciledTransition =
        activeTransition?.toOrganizationId === organizationId
          ? activeTransition
          : {
              ...createTransition(currentOrganization.id, organizationId),
              phase: 'decision' as const,
            };

      setCurrentTransition({ ...reconciledTransition, phase: 'decision' });
    },
    [createTransition, currentOrganization.id, setCurrentTransition],
  );

  const reconcileFromServer = useCallback(async () => {
    const transitionAtStart = transitionRef.current;
    try {
      const organizationId = await fetchSessionOrganizationId();
      if (transitionRef.current !== transitionAtStart) return;
      reconcileWithSessionOrganization(organizationId);
    } catch {
      // Authentication redirects are handled by the server function. Keep the
      // current protection state until navigation completes or recovery retries.
    }
  }, [fetchSessionOrganizationId, reconcileWithSessionOrganization]);

  const handleChannelMessage = useCallback(
    (event: MessageEvent<unknown>) => {
      const parsedMessage = organizationChangeMessageSchema.safeParse(event.data);
      if (!parsedMessage.success) return;

      const message = parsedMessage.data;
      const activeTransition = transitionRef.current;
      if (
        activeTransition &&
        activeTransition.transitionId !== message.transitionId &&
        activeTransition.startedAt > message.startedAt
      ) {
        return;
      }

      const nextTransition: OrganizationTransition = {
        transitionId: message.transitionId,
        sourceTabId: message.sourceTabId,
        fromOrganizationId: currentOrganization.id,
        toOrganizationId: message.toOrganizationId,
        startedAt: message.startedAt,
      };

      if (message.status === 'started') {
        setCurrentTransition({ ...nextTransition, phase: 'pending' });
        return;
      }

      if (message.status === 'cancelled') {
        if (activeTransition?.transitionId === message.transitionId) {
          void reconcileFromServer();
        }
        return;
      }

      if (message.toOrganizationId === currentOrganization.id) {
        setCurrentTransition(null);
        return;
      }

      setCurrentTransition({ ...nextTransition, phase: 'decision' });
    },
    [currentOrganization.id, reconcileFromServer, setCurrentTransition],
  );

  useEffect(() => {
    if (!supportsBroadcastChannel()) return;

    getTabId();
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;
    channel.addEventListener('message', handleChannelMessage);

    const reconcileVisibleTab = () => {
      if (document.visibilityState !== 'visible') return;
      const activeTransition = transitionRef.current;
      if (activeTransition?.phase === 'pending' || activeTransition?.phase === 'returning') return;
      void reconcileFromServer();
    };

    document.addEventListener('visibilitychange', reconcileVisibleTab);
    window.addEventListener('pageshow', reconcileVisibleTab);
    void reconcileFromServer();

    return () => {
      document.removeEventListener('visibilitychange', reconcileVisibleTab);
      window.removeEventListener('pageshow', reconcileVisibleTab);
      channel.removeEventListener('message', handleChannelMessage);
      channel.close();
      if (channelRef.current === channel) channelRef.current = null;
    };
  }, [getTabId, handleChannelMessage, reconcileFromServer]);

  useEffect(() => {
    if (!transition) return;

    void queryClient.cancelQueries();
    focusManager.setFocused(false);
    const keepQueriesPaused = () => focusManager.setFocused(false);
    window.addEventListener('focus', keepQueriesPaused);

    return () => {
      window.removeEventListener('focus', keepQueriesPaused);
      focusManager.setFocused(undefined);
    };
  }, [queryClient, transition]);

  useEffect(() => {
    if (transition?.phase === 'decision' && transition.toOrganizationId === currentOrganization.id) {
      setCurrentTransition(null);
    }
  }, [currentOrganization.id, setCurrentTransition, transition]);

  useEffect(() => {
    if (transition?.phase !== 'pending') return;
    if (transition.sourceTabId === tabIdRef.current) return;

    const timeout = window.setTimeout(() => {
      void withOrganizationChangeLock(reconcileFromServer);
    }, RECOVERY_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [reconcileFromServer, transition]);

  const changeServerOrganization = useCallback(
    async (organizationId: string) => {
      const { firebaseIdToken } = clientServices.authenticationClientService.authenticationClientRepository;
      const idToken = await firebaseIdToken();
      await changeOrganizationIdMutation.mutateAsync({ idToken, csrf, newOrganizationId: organizationId });
    },
    [changeOrganizationIdMutation, clientServices, csrf],
  );

  const navigateToSessionOrganization = useCallback(async () => {
    queryClient.removeQueries();
    router.clearCache();
    try {
      await router.navigate({ to: '/app-router', replace: true });
    } finally {
      await router.invalidate({ sync: true });
    }
  }, [queryClient, router]);

  const performUncoordinatedChange = useCallback(
    async (organizationId: string) => {
      const nextTransition = createTransition(currentOrganization.id, organizationId);
      setCurrentTransition({ ...nextTransition, phase: 'pending', silent: true });
      try {
        await changeServerOrganization(organizationId);
        setCurrentTransition({ ...nextTransition, phase: 'decision', silent: true });
        await navigateToSessionOrganization();
      } catch {
        await reconcileFromServer();
        if (!revealCurrentTransition()) {
          toast.error(t('organization_change.switch_error'));
        }
      }
    },
    [
      changeServerOrganization,
      createTransition,
      currentOrganization.id,
      navigateToSessionOrganization,
      reconcileFromServer,
      revealCurrentTransition,
      setCurrentTransition,
      t,
    ],
  );

  const requestOrganizationChange = useCallback(
    (organizationId: string) => {
      if (organizationId === currentOrganization.id) return;

      if (!supportsBroadcastChannel() || !channelRef.current) {
        void performUncoordinatedChange(organizationId);
        return;
      }

      void withOrganizationChangeLock(async () => {
        if (transitionRef.current) return;

        let sessionOrganizationId: string;
        try {
          sessionOrganizationId = await fetchSessionOrganizationId();
        } catch {
          toast.error(t('organization_change.switch_error'));
          return;
        }

        if (sessionOrganizationId !== currentOrganization.id) {
          reconcileWithSessionOrganization(sessionOrganizationId);
          return;
        }

        const nextTransition = createTransition(currentOrganization.id, organizationId);
        setCurrentTransition({ ...nextTransition, phase: 'pending', silent: true });
        broadcast('started', nextTransition);

        try {
          await changeServerOrganization(organizationId);
        } catch {
          broadcast('cancelled', nextTransition);
          await reconcileFromServer();
          revealCurrentTransition();
          toast.error(t('organization_change.switch_error'));
          return;
        }

        broadcast('committed', nextTransition);
        setCurrentTransition({ ...nextTransition, phase: 'decision', silent: true });
        try {
          await navigateToSessionOrganization();
        } catch {
          revealCurrentTransition();
          toast.error(t('organization_change.switch_error'));
        }
      });
    },
    [
      broadcast,
      changeServerOrganization,
      createTransition,
      currentOrganization.id,
      fetchSessionOrganizationId,
      navigateToSessionOrganization,
      performUncoordinatedChange,
      reconcileFromServer,
      reconcileWithSessionOrganization,
      revealCurrentTransition,
      setCurrentTransition,
      t,
    ],
  );

  const acceptNextOrganization = useCallback(() => {
    void (async () => {
      try {
        const sessionOrganizationId = await fetchSessionOrganizationId();
        if (sessionOrganizationId === currentOrganization.id) {
          setCurrentTransition(null);
          return;
        }

        const activeTransition = transitionRef.current;
        if (activeTransition && activeTransition.toOrganizationId !== sessionOrganizationId) {
          reconcileWithSessionOrganization(sessionOrganizationId);
          return;
        }

        await navigateToSessionOrganization();
      } catch {
        toast.error(t('organization_change.switch_error'));
      }
    })();
  }, [
    currentOrganization.id,
    fetchSessionOrganizationId,
    navigateToSessionOrganization,
    reconcileWithSessionOrganization,
    setCurrentTransition,
    t,
  ]);

  const returnToPreviousOrganization = useCallback(() => {
    const protectedTransition = transitionRef.current;
    if (!protectedTransition || protectedTransition.phase === 'pending') return;

    setCurrentTransition({ ...protectedTransition, phase: 'returning' });

    void withOrganizationChangeLock(async () => {
      if (transitionRef.current?.transitionId !== protectedTransition.transitionId) return;

      let sessionOrganizationId: string;
      try {
        sessionOrganizationId = await fetchSessionOrganizationId();
      } catch {
        setCurrentTransition({ ...protectedTransition, phase: 'error' });
        return;
      }

      if (sessionOrganizationId === protectedTransition.fromOrganizationId) {
        setCurrentTransition(null);
        return;
      }

      if (sessionOrganizationId !== protectedTransition.toOrganizationId) {
        reconcileWithSessionOrganization(sessionOrganizationId);
        return;
      }

      const reverseTransition = createTransition(
        protectedTransition.toOrganizationId,
        protectedTransition.fromOrganizationId,
      );
      broadcast('started', reverseTransition);

      try {
        await changeServerOrganization(protectedTransition.fromOrganizationId);
      } catch {
        broadcast('cancelled', reverseTransition);
        setCurrentTransition({ ...protectedTransition, phase: 'error' });
        return;
      }

      broadcast('committed', reverseTransition);
      setCurrentTransition(null);
    });
  }, [
    broadcast,
    changeServerOrganization,
    createTransition,
    fetchSessionOrganizationId,
    reconcileWithSessionOrganization,
    setCurrentTransition,
  ]);

  const contextValue = useMemo(
    () => ({ changeOrganizationId: requestOrganizationChange }),
    [requestOrganizationChange],
  );

  const getOrganizationName = (organizationId: string) => {
    if (organizationId === currentOrganization.id) return currentOrganization.name;
    return (
      organizations.find((organization) => organization.id === organizationId)?.name ?? t('organization_change.unknown')
    );
  };

  return (
    <OrganizationChangeContext.Provider value={contextValue}>
      <div className="contents" inert={transition?.silent === true}>
        {children}
      </div>
      {transition && !transition.silent ? (
        <OrganizationChangeModal
          phase={transition.phase}
          previousOrganizationName={getOrganizationName(transition.fromOrganizationId)}
          nextOrganizationName={getOrganizationName(transition.toOrganizationId)}
          onAcceptNextOrganization={acceptNextOrganization}
          onReturnToPreviousOrganization={returnToPreviousOrganization}
        />
      ) : null}
    </OrganizationChangeContext.Provider>
  );
}
