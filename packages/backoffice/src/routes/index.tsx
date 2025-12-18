import { useAuthSession } from "@bo/utils/session";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	server: {
		handlers: {
			GET: async () => {
				const authSession = await useAuthSession();

				if (!authSession.data?.authToken) {
					return redirect({ to: "/sign-in" });
				}

				return redirect({ to: "/dashboard" });
			},
		},
	},
});
