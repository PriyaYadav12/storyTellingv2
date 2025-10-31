import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import OnboardingForm from "@/components/onboarding-form";

export const Route = createFileRoute("/onboarding")({
	component: OnboardingComponent,
});

function OnboardingComponent() {
	const hasProfile = useQuery(api.userProfiles.hasProfile);

	return (
		<>
			<AuthLoading>{null}</AuthLoading>
			<Unauthenticated>
				<Navigate to="/" replace />
			</Unauthenticated>
			<Authenticated>
				{hasProfile === true ? (
					<Navigate to="/dashboard" replace />
				) : hasProfile === false ? (
					<OnboardingForm />
				) : (
					<div className="flex items-center justify-center min-h-screen">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				)}
			</Authenticated>
		</>
	);
}
