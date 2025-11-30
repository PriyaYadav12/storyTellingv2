import StoryCard from "@/components/StoryCard";
import type { TransformedStory } from "@/hooks/useStoriesFilter";

interface StoriesGridProps {
	stories: TransformedStory[];
	onPlayStory: (id: string) => void;
}

export function StoriesGrid({ stories, onPlayStory }: StoriesGridProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{stories.map((story) => (
				<StoryCard key={story.id} {...story} onPlay={onPlayStory} />
			))}
		</div>
	);
}
