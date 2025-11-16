import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import AdminForgotPasswordForm from "@/components/admin/admin-forgot-password-form";

export const Route = createFileRoute("/admin/forgot-password")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<AuthLoading>{null}</AuthLoading>
			<Authenticated>
				<Navigate to="/admin/dashboard" replace />
			</Authenticated>
			<Unauthenticated>
				<AdminForgotPasswordForm />
			</Unauthenticated>
		</>
	);
}

