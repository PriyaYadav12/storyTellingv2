// apps/web/src/routes/story.$storyId.tsx
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { StoryMediaPlayer } from "@/components/story-media-player";

export const Route = createFileRoute("/story/$storyId")({
	component: StoryPageComponent,
});

function StoryPageComponent() {
	const { storyId } = Route.useParams();
	const navigate = useNavigate();

	const hasStoryId = typeof storyId === "string" && storyId !== "undefined" && storyId.length > 0;

	const story = useQuery(api.stories.get, hasStoryId ? { storyId: storyId as any } : "skip");
	const sceneImages = useQuery(api.stories.getSceneImageUrls as any, hasStoryId ? { storyId: storyId as any } : "skip");
	const narrationFile = useQuery(api.stories.getNarrationFileUrl as any, hasStoryId ? { storyId: storyId as any } : "skip");

	useEffect(() => {}, []);

	return (
		<>
			<AuthLoading>{null}</AuthLoading>
			<Authenticated>
				<div className="container mx-auto max-w-4xl px-4 py-8">
					{/* Back button */}
					<Button
						variant="ghost"
						onClick={() => navigate({ to: "/dashboard" })}
						className="mb-6"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Dashboard
					</Button>

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
						<div className="space-y-6">
							{/* Header */}
							<div className="text-center space-y-4">
								<h1 className="text-lg md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
									{story.title}
								</h1>
								<div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
									<span>Theme: {story.params.theme}</span>
									{story.params.lesson && <span>• Lesson: {story.params.lesson}</span>}
									<span>• {story.params.length}</span>
								</div>
							</div>

					{/* Synchronized media player */}
					{Array.isArray(sceneImages) && sceneImages.length > 0 && (
						<StoryMediaPlayer images={sceneImages as any} audioUrl={narrationFile?.url} />
					)}
						{story.content ? (
								<div className="prose prose-lg max-w-none dark:prose-invert">
									<div className="text-base md:text-xl leading-relaxed whitespace-pre-wrap bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-8 rounded-2xl border border-purple-100 dark:border-purple-900 shadow-lg">
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

					{/* Media player handles audio state; no separate audio block needed */}
						</div>
					)}
				</div>
			</Authenticated>
			<Unauthenticated>
				<Navigate to="/" replace />
			</Unauthenticated>
		</>
	);
}