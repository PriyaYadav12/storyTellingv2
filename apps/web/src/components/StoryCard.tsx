import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Play, User } from "lucide-react";

interface StoryCardProps {
	id: string;
	title: string;
	theme: string;
	childName: string;
	adventure: string;
	language: string;
	createdAt: string;
	readingTime: string;
	coverImage?: string;
	onPlay?: (id: string) => void;
}

export default function StoryCard({
	id,
	title,
	theme,
	childName,
	adventure,
	language,
	createdAt,
	readingTime,
	coverImage,
	onPlay,
}: StoryCardProps) {
	const firstSceneImageUrl = useQuery(api.stories.getFirstSceneImageUrl, { storyId: id as any });

	const handleClick = () => {
		onPlay?.(id);
	};

	return (
		<Card 
			className="p-6 rounded-3xl hover:shadow-lg active:scale-95 transition-all group cursor-pointer" 
			data-testid={`card-story-${id}`}
			onClick={handleClick}
		>
			<div className="space-y-4">
				<div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
					{firstSceneImageUrl ? (
						<img src={firstSceneImageUrl} alt={title} className="w-full h-full object-cover" />
					) : firstSceneImageUrl === null ? (
						<div className="text-6xl">📚</div>
					) : (
						<div className="animate-pulse bg-muted rounded-lg w-full h-full" />
					)}
				</div>

				<div className="space-y-3">
					<h3 className="text-xl font-bold line-clamp-2" data-testid={`text-story-title-${id}`}>
						{title}
					</h3>

					<div className="flex flex-wrap gap-2">
						<Badge variant="default" className="rounded-xl" data-testid={`badge-theme-${id}`}>
							{theme}
						</Badge>
						<Badge variant="secondary" className="rounded-xl" data-testid={`badge-child-${id}`}>
							<User className="w-3 h-3 mr-1" />
							{childName}
						</Badge>
						<Badge variant="secondary" className="rounded-xl" data-testid={`badge-adventure-${id}`}>
							{adventure}
						</Badge>
						<Badge variant="secondary" className="rounded-xl" data-testid={`badge-language-${id}`}>
							{language}
						</Badge>
					</div>

					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Calendar className="w-4 h-4" />
							<span>{createdAt}</span>
						</div>
						<div className="flex items-center gap-1">
							<Clock className="w-4 h-4" />
							<span>{readingTime}</span>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}

