import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import UserMenu from "@/components/user-menu";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useConvexAuth,
} from "convex/react";
import { useQuery } from "convex/react";
import { useState } from "react";
import { BookOpen, Sparkles, Star, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StoryCreateForm from "@/components/story-create-form";
import type { Doc } from "@story-telling-v2/backend/convex/_generated/dataModel";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StoriesList } from "@/components/dashboard/StoriesList";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [activeTab, setActiveTab] = useState<"generate" | "view">("generate");
	const { isAuthenticated } = useConvexAuth();
	const hasProfile = useQuery(api.userProfiles.hasProfile,isAuthenticated ? {} : "skip");
	const stories = useQuery(api.stories.list,isAuthenticated ? {} : "skip");

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
					<div className="container mx-auto max-w-7xl px-4 py-8">
						<DashboardHeader />

						{/* Quick Actions */}
						<QuickActions />

						{/* Tabs */}
						<div className="mb-6">
							<div className="flex gap-2 border-b border-muted-foreground/20 overflow-x-auto">
								<button
									onClick={() => setActiveTab("generate")}
									className={`px-4 py-2 text-sm whitespace-nowrap rounded-t-md ${
										activeTab === "generate"
											? "bg-background border-x border-t border-muted-foreground/20 font-medium"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									Generate Story
								</button>
								<button
									onClick={() => setActiveTab("view")}
									className={`px-4 py-2 text-sm whitespace-nowrap rounded-t-md ${
										activeTab === "view"
											? "bg-background border-x border-t border-muted-foreground/20 font-medium"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									View Stories
								</button>
							</div>

							<div className="border border-muted-foreground/20 rounded-b-md rounded-tr-md p-4">
								{activeTab === "generate" ? (
									<StoryCreateForm onStoryGenerated={() => setActiveTab("view")} />
								) : (
									<StoriesList stories={stories} />
								)}
							</div>
						</div>

						{/* User Menu */}
						<div className="flex justify-end">
							<UserMenu />
						</div>
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

