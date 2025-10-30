import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
        <>
            {/* Prevent flicker while auth is resolving */}
            <AuthLoading>{null}</AuthLoading>
            {/* If logged in, go straight to dashboard */}
            <Authenticated>
                <Navigate to="/dashboard" replace />
            </Authenticated>
            {/* Otherwise show the landing page */}
            <Unauthenticated>
            <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="max-w-4xl w-full text-center space-y-8">
				{/* Hero Section */}
				<div className="space-y-6 animate-fade-in">
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-purple-200 dark:border-purple-800 shadow-sm">
						<Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
						<span className="text-sm font-medium text-purple-700 dark:text-purple-300">
							Lalli Fafa Land
						</span>
					</div>
					
					<h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
						Welcome to Lalli Fafa Land
					</h1>
					
					<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
						Discover amazing stories, create your own adventures, and bring characters to life!
					</p>
				</div>

				{/* Feature Cards */}
				<div className="grid md:grid-cols-3 gap-6 mt-12">
					<div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-purple-100 dark:border-purple-900 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4 mx-auto">
							<BookOpen className="h-6 w-6 text-white" />
						</div>
						<h3 className="font-semibold text-lg mb-2">Read Stories</h3>
						<p className="text-sm text-muted-foreground">
							Explore a library of exciting tales
						</p>
					</div>

					<div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-purple-100 dark:border-purple-900 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center mb-4 mx-auto">
							<Sparkles className="h-6 w-6 text-white" />
						</div>
						<h3 className="font-semibold text-lg mb-2">Create Magic</h3>
						<p className="text-sm text-muted-foreground">
							Build your own story adventures
						</p>
					</div>

					<div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-purple-100 dark:border-purple-900 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center mb-4 mx-auto">
							<Sparkles className="h-6 w-6 text-white" />
						</div>
						<h3 className="font-semibold text-lg mb-2">Play & Learn</h3>
						<p className="text-sm text-muted-foreground">
							Interactive games and activities
						</p>
					</div>
				</div>

				{/* CTA */}
                <div className="pt-8">
						<Link to="/dashboard">
							<Button
								size="lg"
								className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
							>
								Start Your Adventure
							</Button>
						</Link>
				</div>
			</div>
			
        </div>
            </Unauthenticated>
        </>
	);
}
