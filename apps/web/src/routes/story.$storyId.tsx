// apps/web/src/routes/story.$storyId.tsx
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { ArrowLeft, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { StoryMediaPlayer } from "@/components/story-media-player";

export const Route = createFileRoute("/story/$storyId")({
	component: StoryPageComponent,
});

function StoryPageComponent() {
	const { storyId } = Route.useParams();
	const navigate = useNavigate();
	const [isFavorite, setIsFavorite] = useState(false);

	const hasStoryId = typeof storyId === "string" && storyId !== "undefined" && storyId.length > 0;

	const story = useQuery(api.stories.get, hasStoryId ? { storyId: storyId as any } : "skip");
	const sceneImages = useQuery(api.stories.getSceneImageUrls as any, hasStoryId ? { storyId: storyId as any } : "skip");
	const narrationFile = useQuery(api.stories.getNarrationFileUrl as any, hasStoryId ? { storyId: storyId as any } : "skip");

	const handleBack = () => {
		navigate({ to: "/library" });
	};

	const handleShare = () => {
		console.log("Share story");
		// Implement share functionality
	};

	const handleToggleFavorite = () => {
		setIsFavorite(!isFavorite);
		console.log(isFavorite ? "Removed from favorites" : "Added to favorites");
	};

	return (
		<>
			<AuthLoading>{null}</AuthLoading>
			<Authenticated>
				<div className="min-h-screen bg-background">
					<main className="container mx-auto px-4 md:px-8 py-8 md:py-12">
						<div className="max-w-5xl mx-auto space-y-8">
							<div className="flex items-center justify-between">
								<Button
									variant="ghost"
									onClick={handleBack}
									className="gap-2"
									data-testid="button-back"
								>
									<ArrowLeft className="w-5 h-5" />
									Back to Library
								</Button>
								<div className="flex gap-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={handleShare}
										data-testid="button-share"
									>
										<Share2 className="w-5 h-5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={handleToggleFavorite}
										data-testid="button-favorite"
									>
										<Heart
											className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
										/>
									</Button>
								</div>
							</div>

					{story === undefined ? (
						// Loading state
						<div className="flex items-center justify-center py-20">
							<div className="text-center space-y-4">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
								<p className="text-lg text-muted-foreground">Loading your magical story...</p>
							</div>
						</div>
					) : !story ? (
						// Story not found
						<div className="text-center py-20">
							<p className="text-lg text-red-600 mb-4">Story not found</p>
							<Button onClick={() => navigate({ to: "/dashboard" })}>
								Back to Dashboard
							</Button>
						</div>
					) : (
						// Story content
						<>
							<div className="space-y-4">
								<h1 className="text-4xl md:text-5xl font-bold" data-testid="text-story-title">
									{story.title}
								</h1>
								<div className="flex flex-wrap gap-2">
									<Badge variant="default" className="rounded-xl text-base px-4 py-1">
										{story.params.theme as string}
									</Badge>
									{story.params.lesson && (
										<Badge variant="secondary" className="rounded-xl text-base px-4 py-1">
											Lesson: {story.params.lesson as string}
										</Badge>
									)}
									<Badge variant="secondary" className="rounded-xl text-base px-4 py-1">
										{story.params.language as string}
									</Badge>
									<Badge variant="secondary" className="rounded-xl text-base px-4 py-1">
										{story.params.length as string}
									</Badge>
								</div>
							</div>

							{/* Synchronized media player */}
							{Array.isArray(sceneImages) && sceneImages.length > 0 && (
								<StoryMediaPlayer
									images={sceneImages as any}
									audioUrl={narrationFile?.url}
									canPlay={sceneImages.every((scene: any) => !!scene?.filePath)}
								/>
							)}

							{story.content ? (
								<div className="prose prose-lg max-w-none dark:prose-invert">
									<div className="text-base md:text-xl leading-relaxed whitespace-pre-wrap bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-8 rounded-3xl border border-purple-100 dark:border-purple-900 shadow-lg">
										{story.content}
									</div>
								</div>
							) : story.status === "generating" || story.status === "queued" ? (
								<div className="flex items-center justify-center py-20">
									<div className="text-center space-y-4">
										<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
										<p className="text-xl text-muted-foreground">Creating your magical story...</p>
										<p className="text-sm text-muted-foreground">This might take a moment</p>
									</div>
								</div>
							) : story.status === "error" ? (
								<div className="text-center py-20">
									<p className="text-lg text-red-600 mb-2">Something went wrong</p>
									<p className="text-sm text-muted-foreground">{story.error}</p>
									<Button onClick={() => navigate({ to: "/dashboard" })} className="mt-4">
										Back to Dashboard
									</Button>
								</div>
							) : null}

							<div className="text-center py-8">
								<Button
									size="lg"
									onClick={() => navigate({ to: "/dashboard" })}
									className="rounded-2xl px-8"
									data-testid="button-create-another"
								>
									Create Another Story
								</Button>
							</div>
						</>
					)}
						</div>
					</main>
				</div>
			</Authenticated>
			<Unauthenticated>
				<Navigate to="/" replace />
			</Unauthenticated>
		</>
	);
}