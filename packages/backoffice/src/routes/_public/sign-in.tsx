import { useFirebase } from "@bo/hooks/useFirebase";
import { signinFn } from "@bo/server-fns/auth";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "ui-design-system";

export const Route = createFileRoute("/_public/sign-in")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="h-full grid place-content-center">
			<SignInWithGoogle />
		</div>
	);
}

function SignInWithGoogle() {
	const callSigninFn = useServerFn(signinFn);
	const firebaseClient = useFirebase();
	const signIn = async () => {
		const idToken = await firebaseClient.signInWithGoogle();
		await callSigninFn({ data: { idToken } });
	};

	return (
		<ClientOnly fallback={<SignInWithGoogleButton />}>
			<SignInWithGoogleButton onClick={signIn} />
		</ClientOnly>
	);
}

type SignInWithGoogleButtonProps = {
	onClick?: () => void;
};
function SignInWithGoogleButton({ onClick }: SignInWithGoogleButtonProps) {
	return (
		<Button variant="secondary" size="default" onClick={onClick}>
			Sign in with Google
		</Button>
	);
}
