import { finishSsoTestSignInFn, startSsoTestSignInFn } from '@app-builder/server-fns/sso-test';
import { sleep } from '@app-builder/utils/sleep';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useRef, useState } from 'react';
import { type SsoConnection } from './sso-form';

type StartSsoTestResult = Awaited<ReturnType<typeof startSsoTestSignInFn>>;
type FinishSsoTestResult = Awaited<ReturnType<typeof finishSsoTestSignInFn>>;
type FinishSsoTestFailure = Extract<FinishSsoTestResult, { status: 'error' }>;

export type SsoTestError =
  | Extract<StartSsoTestResult, { success: false }>['error']
  | FinishSsoTestFailure['error']
  | 'popup_blocked'
  | 'timeout'
  | 'unknown';
export type SsoTestReason = NonNullable<FinishSsoTestFailure['reason']>;

export type SsoTestState =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'success'; connection: SsoConnection; email: string; testedAt: string }
  | (Omit<FinishSsoTestFailure, 'error'> & { error: SsoTestError });

/** The popup's landing page posts on this channel once the identity provider has redirected back. */
export const SSO_TEST_CHANNEL = 'marble-sso-test';
// Each poll goes through the auth middleware: the channel message is the fast path, polling the fallback.
const POLL_INTERVAL_MS = 5000;
// The server forgets the test after 5 minutes too.
const TEST_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Runs a test sign-in in a popup: the server starts it, the identity provider redirects the popup to
 * `/oidc/callback`, which stores the code and lands on the page that posts on `SSO_TEST_CHANNEL`; `finish`
 * then exchanges the code, right away on that message or on the next fallback poll.
 * `popup.closed` is never read: identity providers that set COOP make it true while the flow still runs.
 */
export function useSsoTestSignIn() {
  const startTest = useServerFn(startSsoTestSignInFn);
  const finishTest = useServerFn(finishSsoTestSignInFn);
  const [state, setState] = useState<SsoTestState>({ status: 'idle' });
  const runIdRef = useRef(0);
  const popupRef = useRef<Window | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const stop = () => {
    runIdRef.current += 1;
    popupRef.current?.close();
    popupRef.current = null;
    channelRef.current?.close();
    channelRef.current = null;
  };

  useEffect(() => stop, []);

  // Call it straight from the click handler: browsers block a popup opened after an await.
  const run = async (connection: SsoConnection) => {
    stop();
    const popup = window.open('about:blank', '_blank', 'popup,width=520,height=680');
    if (!popup) {
      setState({ status: 'error', error: 'popup_blocked' });
      return;
    }
    // The identity provider gets no handle on this page; the reference kept here still drives the popup.
    popup.opener = null;
    popupRef.current = popup;
    const runId = runIdRef.current;
    const isCurrent = () => runIdRef.current === runId;
    const end = (next: SsoTestState) => {
      if (!isCurrent()) return;
      stop();
      setState(next);
    };

    // A message that arrives during a poll resolves the next wait, so the poll after it starts at once.
    let resolveMessage: (() => void) | undefined;
    const nextMessage = () =>
      new Promise<void>((resolve) => {
        resolveMessage = resolve;
      });
    let message = nextMessage();
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(SSO_TEST_CHANNEL);
      channel.onmessage = () => resolveMessage?.();
      channelRef.current = channel;
    }

    setState({ status: 'running' });
    try {
      const started = await startTest({
        data: {
          issuer: connection.issuer,
          clientId: connection.clientId,
          scopes: connection.scopes,
          extraParams: connection.extraParams ?? {},
        },
      });
      // `undefined` means the server redirected: the page is no longer available to this user.
      if (!started) return end({ status: 'idle' });
      if (!started.success) return end({ status: 'error', error: started.error });
      if (!isCurrent()) return;
      popup.location.href = started.authorizationUrl;

      const deadline = Date.now() + TEST_TIMEOUT_MS;
      while (Date.now() < deadline) {
        await Promise.race([sleep(POLL_INTERVAL_MS), message]);
        message = nextMessage();
        if (!isCurrent()) return;
        // Sequential on purpose: the code is single-use, so two overlapping polls would fail the exchange.
        const result = await finishTest({
          data: { clientSecret: connection.clientSecret, emailClaim: connection.emailClaim },
        });
        if (!result) return end({ status: 'idle' });
        if (result.status === 'pending') continue;
        return end(
          result.status === 'success'
            ? { status: 'success', connection, email: result.email, testedAt: result.testedAt }
            : result,
        );
      }
      end({ status: 'error', error: 'timeout' });
    } catch {
      end({ status: 'error', error: 'unknown' });
    }
  };

  const cancel = () => {
    stop();
    setState({ status: 'idle' });
  };

  return { state, setState, run, cancel };
}
