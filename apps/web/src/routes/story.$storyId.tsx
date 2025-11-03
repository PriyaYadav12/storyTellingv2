// apps/web/src/routes/story.$storyId.tsx
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { ArrowLeft, Volume2, PlayCircle, Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/story/$storyId")({
	component: StoryPageComponent,
});

function StoryPageComponent() {
	const { storyId } = Route.useParams();
	const navigate = useNavigate();
	const story = useQuery(api.stories.get, { storyId: storyId as any });
	const sceneImages = useQuery(api.stories.getSceneImageUrls as any, { storyId: storyId as any });

	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);

	useEffect(() => {
		if (!Array.isArray(sceneImages) || sceneImages.length <= 1 || !isPlaying) return;
		const id = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % sceneImages.length);
		}, 4000);
		return () => clearInterval(id);
	}, [sceneImages, isPlaying]);

	useEffect(() => {
		setCurrentIndex(0);
	}, [sceneImages?.length]);

	const goPrev = () => {
		if (!Array.isArray(sceneImages) || sceneImages.length === 0) return;
		setCurrentIndex((prev) => (prev - 1 + sceneImages.length) % sceneImages.length);
	};

	const goNext = () => {
		if (!Array.isArray(sceneImages) || sceneImages.length === 0) return;
		setCurrentIndex((prev) => (prev + 1) % sceneImages.length);
	};

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

							{/* Story content */}
						{/* Scene slideshow */}
						{/* Scene slideshow */}
						{Array.isArray(sceneImages) && sceneImages.length > 0 && (
							<div className="relative w-full overflow-hidden rounded-2xl border border-purple-100 dark:border-purple-900 bg-muted aspect-[16/9] p-4 md:p-6">
								{sceneImages[currentIndex]?.url ? (
									<img
										src={sceneImages[currentIndex].url}
										alt={sceneImages[currentIndex]?.description || `Scene ${sceneImages[currentIndex]?.sceneNumber}`}
										className="h-full w-full object-contain"
									/>
								) : (
									<div className="h-full w-full flex items-center justify-center text-muted-foreground">Loading image…</div>
								)}

								{/* Left/Right controls */}
								<div className="absolute inset-y-0 left-0 flex items-center">
									<Button variant="ghost" size="icon" onClick={goPrev} className="m-2 rounded-full bg-background/60 hover:bg-background/80">
										<ChevronLeft className="h-5 w-5" />
									</Button>
								</div>
								<div className="absolute inset-y-0 right-0 flex items-center">
									<Button variant="ghost" size="icon" onClick={goNext} className="m-2 rounded-full bg-background/60 hover:bg-background/80">
										<ChevronRight className="h-5 w-5" />
									</Button>
								</div>

								{/* Bottom bar: play/pause & index (no caption) */}
								<div className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-2 p-3 bg-gradient-to-t from-black/50 to-transparent text-white">
									<div className="text-xs opacity-80">{currentIndex + 1}/{sceneImages.length}</div>
									<Button
										variant="secondary"
										size="icon"
										onClick={() => setIsPlaying((p) => !p)}
										className="rounded-full"
									>
										{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
									</Button>
								</div>
							</div>
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

							{/* Action buttons - reserved for future TTS and video player */}
							{story.content && (
								<div className="flex justify-center gap-4 pt-6 border-t">
									<Button variant="outline" size="lg" disabled>
										<Volume2 className="h-5 w-5 mr-2" />
										Play Narration
									</Button>
									<Button variant="outline" size="lg" disabled>
										<PlayCircle className="h-5 w-5 mr-2" />
										Watch Video
									</Button>
								</div>
							)}
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