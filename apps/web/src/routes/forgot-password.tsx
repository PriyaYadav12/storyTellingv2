import ForgotPasswordForm from "@/components/forgot-password-form";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";

export const Route = createFileRoute("/forgot-password")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Authenticated>
				<Navigate to="/dashboard" replace />
			</Authenticated>
			<Unauthenticated>
				<ForgotPasswordForm />
			</Unauthenticated>
		</>
	);
}


