import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import UserMenu from "@/components/user-menu";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
} from "convex/react";
import { useState } from "react";
import { BookOpen, Sparkles, Star, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const [mode, setMode] = useState<"signin" | "signup">("signin");


	return (
		<>
			{/* Avoid redirecting while auth state is loading */}
			<AuthLoading>{null}</AuthLoading>
			<Authenticated>
				<div className="container mx-auto max-w-7xl px-4 py-8">
					{/* Welcome Header */}
					<div className="mb-8 text-center">
						<h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-3">
							Your Story Dashboard
						</h1>
						<p className="text-lg text-muted-foreground">
							Welcome back! Ready for today's adventure?
						</p>
					</div>

					{/* Stats Cards */}
					<div className="grid md:grid-cols-3 gap-6 mb-8">
						<Card className="border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Stories Read</CardTitle>
								<BookOpen className="h-4 w-4 text-purple-600" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">0</div>
								<p className="text-xs text-muted-foreground">Start reading today!</p>
							</CardContent>
						</Card>

						<Card className="border-pink-200 dark:border-pink-900 bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-950 dark:to-orange-950">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Your Stories</CardTitle>
								<Sparkles className="h-4 w-4 text-pink-600" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">0</div>
								<p className="text-xs text-muted-foreground">Create your first story!</p>
							</CardContent>
						</Card>

						<Card className="border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Achievements</CardTitle>
								<Star className="h-4 w-4 text-orange-600" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">0</div>
								<p className="text-xs text-muted-foreground">Earn your first badge!</p>
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<div className="grid md:grid-cols-2 gap-6 mb-8">
						<Card className="hover:shadow-xl transition-all cursor-pointer border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<BookOpen className="h-5 w-5 text-purple-600" />
									Read a Story
								</CardTitle>
								<CardDescription>
									Choose from our magical collection
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Explore adventures, fairy tales, and fun stories waiting for you!
								</p>
							</CardContent>
						</Card>

						<Card className="hover:shadow-xl transition-all cursor-pointer border-2 border-pink-200 dark:border-pink-800 hover:border-pink-400">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Sparkles className="h-5 w-5 text-pink-600" />
									Create a Story
								</CardTitle>
								<CardDescription>
									Let your imagination run free
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Write your own story with characters, places, and exciting plots!
								</p>
							</CardContent>
						</Card>
					</div>

					{/* User Menu */}
					<div className="flex justify-end">
						<UserMenu />
					</div>
				</div>
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

