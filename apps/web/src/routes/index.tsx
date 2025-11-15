import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import Hero from "@/components/hero";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { CharactersSection } from "@/components/landing/CharactersSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ShopSection } from "@/components/landing/ShopSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const hasProfile = useQuery(api.userProfiles.hasProfile);
	const navigate = useNavigate();

	const handleGetStarted = () => {
		void navigate({ to: "/dashboard" });
	};

	return (
		<>
			{/* Prevent flicker while auth is resolving */}
			<AuthLoading>{null}</AuthLoading>
			
			{/* If logged in, check profile and redirect accordingly */}
			<Authenticated>
				{hasProfile === undefined ? (
					// Loading state
					null
				) : hasProfile === false ? (
					// No profile, redirect to onboarding
					<Navigate to="/onboarding" replace />
				) : (
					// Has profile, go to dashboard
					<Navigate to="/dashboard" replace />
				)}
			</Authenticated>
			
			{/* Otherwise show the landing page */}
			<Unauthenticated>
				<div className="min-h-screen bg-background">
					<LandingHeader onGetStarted={handleGetStarted} />
					
				<main>
					<Hero onGetStarted={handleGetStarted} isAuthenticated={false} />
					<CharactersSection />
					<FeaturesSection />
					<ShopSection />
					<TestimonialsSection />
					<CTASection onGetStarted={handleGetStarted} />
				</main>

					<LandingFooter />
				</div>
			</Unauthenticated>
		</>
	);
}
