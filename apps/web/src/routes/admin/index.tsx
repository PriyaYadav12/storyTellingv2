import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import AdminLoginForm from "@/components/admin/admin-login-form";
import { useState } from "react";

export const Route = createFileRoute("/admin/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [mode, setMode] = useState<"signin" | "signup">("signin");

	return (
		<>
			<AuthLoading>{null}</AuthLoading>
			<Authenticated>
				<Navigate to="/admin/dashboard" replace />
			</Authenticated>
			<Unauthenticated>
				<AdminLoginForm />
			</Unauthenticated>
		</>
	);
}

