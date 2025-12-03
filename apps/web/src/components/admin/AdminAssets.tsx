import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Image, Music, FileText, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import { Pagination } from "@/components/stories/Pagination";

export function AdminAssets() {
	const stories = useQuery(api.stories.listAll);
	const [expandedStory, setExpandedStory] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	// Filter stories to only show those with images in sceneMetadata
	const storiesWithImages = useMemo(() => {
		if (!stories) return [];
		return stories.filter(
			(story) => story.sceneMetadata && story.sceneMetadata.length > 0 && story.status !== "text_ready"
		);
	}, [stories]);

	// Calculate pagination
	const totalPages = Math.ceil(storiesWithImages.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedStories = useMemo(() => {
		return storiesWithImages.slice(startIndex, endIndex);
	}, [storiesWithImages, startIndex, endIndex]);

	const handleDownload = async (url: string, filename: string) => {
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const downloadUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			console.error("Download failed:", error);
		}
	};

	const totalAssets = useMemo(() => {
		return storiesWithImages.reduce((acc, story) => {
			const sceneCount = story.sceneMetadata?.length || 0;
			const hasAudio = story.narrationFilePath ? 1 : 0;
			return acc + sceneCount + hasAudio;
		}, 0);
	}, [storiesWithImages]);

	if (stories === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (storiesWithImages.length === 0) {
		return (
			<div className="text-center py-12">
				<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-muted-foreground">No stories with images found</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Stories with Images</p>
								<p className="text-2xl font-bold">{storiesWithImages.length}</p>
							</div>
							<FileText className="h-8 w-8 text-primary" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Assets</p>
								<p className="text-2xl font-bold">{totalAssets}</p>
							</div>
							<Image className="h-8 w-8 text-primary" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Audio Files</p>
								<p className="text-2xl font-bold">
									{storiesWithImages.filter((s) => s.narrationFilePath).length}
								</p>
							</div>
							<Music className="h-8 w-8 text-primary" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Stories List */}
			<div className="space-y-4">
				{paginatedStories.map((story) => (
					<StoryAssetCard
						key={story._id}
						story={story}
						expanded={expandedStory === story._id}
						onToggleExpand={() =>
							setExpandedStory(expandedStory === story._id ? null : story._id)
						}
						onDownload={handleDownload}
					/>
				))}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={(page) => {
						setCurrentPage(page);
						setExpandedStory(null); // Collapse any expanded story when changing pages
					}}
				/>
			)}
		</div>
	);
}

interface StoryAssetCardProps {
	story: any;
	expanded: boolean;
	onToggleExpand: () => void;
	onDownload: (url: string, filename: string) => void;
}

function StoryAssetCard({
	story,
	expanded,
	onToggleExpand,
	onDownload,
}: StoryAssetCardProps) {
	const sceneImages = useQuery(
		api.stories.getSceneImageUrls,
		expanded ? { storyId: story._id } : "skip"
	);
	const narrationFile = useQuery(
		api.stories.getNarrationFileUrl,
		expanded ? { storyId: story._id } : "skip"
	);

	const sceneCount = story.sceneMetadata?.length || 0;
	const hasAudio = !!story.narrationFilePath;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<CardTitle className="text-lg mb-2">{story.title}</CardTitle>
						<CardDescription className="flex items-center gap-4 flex-wrap">
							<div className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								{new Date(story.createdAt).toLocaleDateString()}
							</div>
							<Badge variant="secondary">{story.params?.theme}</Badge>
							{story.params?.childName && (
								<Badge variant="outline">{story.params.childName}</Badge>
							)}
						</CardDescription>
					</div>
					<Button variant="outline" onClick={onToggleExpand} size="sm">
						{expanded ? "Collapse" : "View Assets"}
					</Button>
				</div>
			</CardHeader>
			{expanded && (
				<CardContent className="space-y-6">
					{/* Scene Images */}
					{sceneCount > 0 && (
						<div>
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-semibold flex items-center gap-2">
									<Image className="h-4 w-4" />
									Scene Images ({sceneCount})
								</h3>
								{sceneImages && sceneImages.length > 0 && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											// Download all scene images
											sceneImages.forEach((scene, index) => {
												if (scene.url) {
													setTimeout(() => {
														onDownload(
															scene.url!,
															`${story.title}-scene-${scene.sceneNumber}.png`
														);
													}, index * 200);
												}
											});
										}}
									>
										<Download className="h-4 w-4 mr-2" />
										Download All
									</Button>
								)}
							</div>
							{sceneImages === undefined ? (
								<div className="flex items-center justify-center py-8">
									<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
								</div>
							) : sceneImages.length === 0 ? (
								<p className="text-sm text-muted-foreground py-4">
									No scene images available
								</p>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
									{sceneImages.map((scene) => (
										<div
											key={scene.sceneNumber}
											className="relative group border rounded-lg overflow-hidden bg-muted/50"
										>
											{scene.url ? (
												<>
													<img
														src={scene.url}
														alt={`Scene ${scene.sceneNumber}`}
														className="w-full h-48 object-cover"
													/>
													<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
														<Button
															variant="secondary"
															size="sm"
															onClick={() =>
																onDownload(
																	scene.url!,
																	`${story.title}-scene-${scene.sceneNumber}.png`
																)
															}
														>
															<Download className="h-4 w-4 mr-2" />
															Download
														</Button>
													</div>
													<div className="absolute top-2 left-2">
														<Badge variant="secondary">
															Scene {scene.sceneNumber}
														</Badge>
													</div>
												</>
											) : (
												<div className="w-full h-48 flex items-center justify-center">
													<p className="text-sm text-muted-foreground">
														Image not available
													</p>
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* Audio File */}
					{hasAudio && (
						<div>
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-semibold flex items-center gap-2">
									<Music className="h-4 w-4" />
									Narration Audio
								</h3>
								{narrationFile?.url && (
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											onDownload(
												narrationFile.url!,
												`${story.title}-narration.mp3`
											)
										}
									>
										<Download className="h-4 w-4 mr-2" />
										Download
									</Button>
								)}
							</div>
							{narrationFile === undefined ? (
								<div className="flex items-center justify-center py-8">
									<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
								</div>
							) : narrationFile?.url ? (
								<Card className="bg-muted/50">
									<CardContent className="pt-6">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<Music className="h-8 w-8 text-primary" />
												<div>
													<p className="font-medium">{story.title} - Narration</p>
													<p className="text-sm text-muted-foreground">Audio file</p>
												</div>
											</div>
											<audio controls className="max-w-xs">
												<source src={narrationFile.url} type="audio/mpeg" />
												Your browser does not support the audio element.
											</audio>
										</div>
									</CardContent>
								</Card>
							) : (
								<p className="text-sm text-muted-foreground py-4">
									Audio file not available
								</p>
							)}
						</div>
					)}

					{sceneCount === 0 && !hasAudio && (
						<p className="text-sm text-muted-foreground py-4 text-center">
							No assets available for this story
						</p>
					)}
				</CardContent>
			)}
		</Card>
	);
}
