import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useConvexAuth,
} from "convex/react";
import { useQuery } from "convex/react";
import { useState, useMemo } from "react";
import StoryGenerationForm from "@/components/StoryGenerationForm";
import HeroCarousel from "@/components/HeroCarousel";
import StatisticsCard from "@/components/StatisticsCard";
import StreakTracker from "@/components/StreakTracker";
import { StoriesList } from "@/components/dashboard/StoriesList";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [activeTab, setActiveTab] = useState<"generate" | "view">("generate");
	const { isAuthenticated } = useConvexAuth();
	const hasProfile = useQuery(api.userProfiles.hasProfile,isAuthenticated ? {} : "skip");
	const profile = useQuery(api.userProfiles.getProfile, isAuthenticated ? {} : "skip");
	const stories = useQuery(api.stories.list,isAuthenticated ? {} : "skip");
	const achievementsData = useQuery(api.userProfiles.getAchievements, isAuthenticated ? {} : "skip");
	
	const userName = profile?.parentName || "Friend";
	
	// Calculate statistics
	const stats = useMemo(() => {
		const storiesList = stories || [];
		const storiesCreated = storiesList.length;
		const readingTime = Math.round(storiesCreated * 3); // Approximate 3 min per story
		const favoriteTheme = storiesList.length > 0 
			? (storiesList[0]?.params?.theme as string) || "Adventure"
			: "Adventure";
		
		// Get earned badge names from achievements
		const earnedBadges = achievementsData?.achievements
			?.filter(a => a.earned)
			.map(a => a.name) || [];
		
		return { storiesCreated, readingTime: readingTime.toString(), favoriteTheme, earnedBadges };
	}, [stories, achievementsData]);
	
	const handleStoryGenerated = (storyId: string) => {
		// Navigate directly to the story page
		navigate({ to: "/story/$storyId", params: { storyId } });
	};

	return (
		<>
			{/* Avoid redirecting while auth state is loading */}
			<AuthLoading>{null}</AuthLoading>
			<Authenticated>
				{hasProfile === undefined ? (
					// Loading state
					<div className="flex items-center justify-center min-h-screen">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : hasProfile === false ? (
					// No profile, redirect to onboarding
					<Navigate to="/onboarding" replace />
				) : (
					// Has profile, show dashboard
					<div className="min-h-screen bg-background">
						<main className="container mx-auto px-4 md:px-8 py-8 md:py-12 space-y-16 md:space-y-20">
							<section data-testid="section-hero">
								<HeroCarousel />
							</section>

							<section data-testid="section-welcome" className="text-center space-y-4">
								<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
									Welcome back, {userName}!
								</h1>
								<p className="text-xl md:text-2xl text-muted-foreground">
									Ready for your next adventure?
								</p>
								<div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
									<button
										onClick={() => {
											setActiveTab("generate");
											document.getElementById("section-story-form")?.scrollIntoView({ behavior: "smooth" });
										}}
										className="px-8 py-3 rounded-full bg-primary text-white font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
									>
										Let's create story!
									</button>
									<button
										onClick={() => {
											navigate({ to: "/library" });
										}}
										className="px-8 py-3 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
									>
										View Stories
									</button>
								</div>
							</section>

							<section data-testid="section-stats">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<StatisticsCard
							storiesCreated={stats.storiesCreated}
							readingTime={stats.readingTime}
							favoriteTheme={stats.favoriteTheme}
							earnedBadges={stats.earnedBadges}
						/>
						<StreakTracker 
							currentStreak={achievementsData?.currentStreak || 0} 
							longestStreak={achievementsData?.longestStreak || 0}
							achievements={achievementsData?.achievements || []}
						/>
								</div>
							</section>

							<section id="section-story-form" data-testid="section-story-form">
								<StoryGenerationForm onGenerate={handleStoryGenerated} />
							</section>
						</main>
					</div>
				)}
			</Authenticated>
		<Unauthenticated>
			{mode === "signin" ? (
				<SignInForm onSwitchToSignUp={() => setMode("signup")} />
			) : (
				<SignUpForm onSwitchToSignIn={() => setMode("signin")} />
			)}
		</Unauthenticated>
			{/* Auth loading handled above to prevent false unauthenticated redirects */}
		</>
	);
}

