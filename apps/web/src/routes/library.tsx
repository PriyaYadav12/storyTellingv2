import { useState, useMemo } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated, useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import StoryCard from "@/components/StoryCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Doc } from "@story-telling-v2/backend/convex/_generated/dataModel";

export const Route = createFileRoute("/library")({
	component: LibraryComponent,
});

function LibraryComponent() {
	const navigate = useNavigate();
	const { isAuthenticated } = useConvexAuth();
	const hasProfile = useQuery(api.userProfiles.hasProfile, isAuthenticated ? {} : "skip");
	const stories = useQuery(api.stories.list, isAuthenticated ? {} : "skip");
	const profile = useQuery(api.userProfiles.getProfile, isAuthenticated ? {} : "skip");
	
	const [searchQuery, setSearchQuery] = useState("");
	const [filterTheme, setFilterTheme] = useState<string>("all");
	const [filterLanguage, setFilterLanguage] = useState<string>("all");

	const childName = profile?.childName || "Child";

	// Transform stories for display
	const transformedStories = useMemo(() => {
		if (!stories) return [];
		return stories.map((story: Doc<"stories">) => ({
			id: story._id,
			title: story.title || "Untitled Story",
			theme: (story.params?.theme as string) || "Adventure",
			childName: childName,
			adventure: (story.params?.theme as string) || "Adventure",
			language: (story.params?.language as string) || "English",
			createdAt: story._creationTime ? new Date(story._creationTime).toLocaleDateString() : "Unknown",
			readingTime: "5 min", // Approximate
		}));
	}, [stories, childName]);

	const filteredStories = transformedStories.filter((story) => {
		const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
							story.adventure.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesTheme = filterTheme === "all" || story.theme === filterTheme;
		const matchesLanguage = filterLanguage === "all" || story.language === filterLanguage;

		return matchesSearch && matchesTheme && matchesLanguage;
	});

	const handlePlayStory = (id: string) => {
		navigate({ to: "/story/$storyId", params: { storyId: id } });
	};

	const themes = useMemo(() => {
		const uniqueThemes = new Set(transformedStories.map(s => s.theme));
		return Array.from(uniqueThemes);
	}, [transformedStories]);

	const languages = useMemo(() => {
		const uniqueLanguages = new Set(transformedStories.map(s => s.language));
		return Array.from(uniqueLanguages);
	}, [transformedStories]);

	return (
		<>
			<AuthLoading>{null}</AuthLoading>
			<Authenticated>
				{hasProfile === undefined ? (
					<div className="flex items-center justify-center min-h-screen">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : hasProfile === false ? (
					<Navigate to="/onboarding" replace />
				) : (
					<div className="min-h-screen bg-background">
						<main className="container mx-auto px-4 md:px-8 py-8 md:py-12">
							<div className="space-y-8">
								<div className="text-center space-y-4">
									<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
										Story Library
									</h1>
									<p className="text-xl text-muted-foreground">
										Explore all your magical adventures
									</p>
								</div>

								<Card className="p-6 rounded-3xl space-y-4">
									<div className="flex items-center gap-2">
										<Filter className="w-5 h-5 text-muted-foreground" />
										<h2 className="text-xl font-bold">Search & Filter</h2>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										<div className="relative">
											<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
											<Input
												placeholder="Search stories..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="pl-10 rounded-xl h-12"
												data-testid="input-search"
											/>
										</div>

										<Select value={filterTheme} onValueChange={setFilterTheme}>
											<SelectTrigger className="rounded-xl h-12" data-testid="select-filter-theme">
												<SelectValue placeholder="All Themes" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Themes</SelectItem>
												{themes.map((theme) => (
													<SelectItem key={theme} value={theme}>
														{theme}
													</SelectItem>
												))}
											</SelectContent>
										</Select>

										<Select value={filterLanguage} onValueChange={setFilterLanguage}>
											<SelectTrigger className="rounded-xl h-12" data-testid="select-filter-language">
												<SelectValue placeholder="All Languages" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Languages</SelectItem>
												{languages.map((lang) => (
													<SelectItem key={lang} value={lang}>
														{lang}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{(searchQuery || filterTheme !== "all" || filterLanguage !== "all") && (
										<Button
											variant="outline"
											onClick={() => {
												setSearchQuery("");
												setFilterTheme("all");
												setFilterLanguage("all");
											}}
											data-testid="button-clear-filters"
										>
											Clear All Filters
										</Button>
									)}
								</Card>

								<div>
									<p className="text-muted-foreground mb-4">
										Showing {filteredStories.length} of {transformedStories.length} stories
									</p>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{filteredStories.map((story) => (
											<StoryCard key={story.id} {...story} onPlay={handlePlayStory} />
										))}
									</div>
								</div>

								{filteredStories.length === 0 && (
									<div className="text-center py-20">
										<div className="text-6xl mb-4">📚</div>
										<h3 className="text-2xl font-bold mb-2">No stories found</h3>
										<p className="text-muted-foreground">
											Try adjusting your search or filters
										</p>
									</div>
								)}
							</div>
						</main>
					</div>
				)}
			</Authenticated>
			<Unauthenticated>
				<Navigate to="/dashboard" replace />
			</Unauthenticated>
		</>
	);
}

