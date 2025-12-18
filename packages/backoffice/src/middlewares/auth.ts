import { useAuthSession } from "@bo/utils/session";
import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { appConfigMiddleware } from "./app-config";

const fetchWithToken = (
	token: string,
	input: RequestInfo | URL,
	init?: RequestInit,
) => {
	const headers = new Headers(init?.headers);
	headers.set("Authorization", `Bearer ${token}`);
	return fetch(input, { ...init, headers });
};

export const authMiddleware = createMiddleware()
	.middleware([appConfigMiddleware])
	.server(async ({ context, next }) => {
		const authSession = await useAuthSession();
		const authToken = authSession.data.authToken;

		let authFetch:
			| ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>)
			| null = null;

		if (authToken && authToken.expires_at >= new Date().toISOString()) {
			authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
				const response = await fetchWithToken(
					authToken.access_token,
					input,
					init,
				);

				if (response.status === 401) {
					if (context.appConfig.auth.provider === "oidc") {
						// TODO: Manage OIDC refresh token
					}

					await authSession.clear();
					throw redirect({ to: "/sign-in" });
				}

				return response;
			};
		}

		return next({ context: { authFetch: authFetch as typeof fetch } });
	});

export const needAuth = createMiddleware()
	.middleware([authMiddleware])
	.server(async ({ context, next }) => {
		if (!context?.authFetch) {
			throw redirect({ to: "/sign-in" });
		}

		const result = await next({ context: { authFetch: context.authFetch } });
		if (
			"error" in result &&
			result.error instanceof Response &&
			result.error.status >= 300 &&
			result.error.status < 400
		) {
			console.log("result.error", result.error);
			throw result.error;
		}

		return result;
	});
