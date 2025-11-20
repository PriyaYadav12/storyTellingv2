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
	return (
		<Card className="p-6 rounded-3xl hover:shadow-lg active:scale-95 transition-all group" data-testid={`card-story-${id}`}>
			<div className="space-y-4">
				<div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
					{coverImage ? (
						<img src={coverImage} alt={title} className="w-full h-full object-cover" />
					) : (
						<div className="text-6xl">📚</div>
					)}
					<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
						<Button
							size="icon"
							className="w-16 h-16 rounded-full"
							onClick={() => onPlay?.(id)}
							data-testid={`button-play-${id}`}
						>
							<Play className="w-8 h-8" fill="currentColor" />
						</Button>
					</div>
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

