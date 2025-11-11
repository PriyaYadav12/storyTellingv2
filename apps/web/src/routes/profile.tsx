import ProfileForm from "@/components/profile-form";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated, useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/profile")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isAuthenticated } = useConvexAuth();
	const hasProfile = useQuery(api.userProfiles.hasProfile, isAuthenticated ? {} : "skip");

	return (
		<>
			<AuthLoading>{null}</AuthLoading>
			<Authenticated>
				{hasProfile === undefined ? null : hasProfile === false ? (
					<Navigate to="/onboarding" replace />
				) : (
					<ProfileForm />
				)}
			</Authenticated>
			<Unauthenticated>
				<Navigate to="/dashboard" replace />
			</Unauthenticated>
		</>
	);
}


