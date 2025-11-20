import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Star, Trophy, Crown } from "lucide-react";

interface StreakTrackerProps {
	currentStreak: number;
	longestStreak: number;
	achievements?: { icon: string; name: string; earned: boolean }[];
}

const achievementIcons = {
	star: Star,
	trophy: Trophy,
	crown: Crown,
	flame: Flame,
};

export default function StreakTracker({ 
	currentStreak = 7, 
	longestStreak = 12,
	achievements = [
		{ icon: "star", name: "First Story", earned: true },
		{ icon: "flame", name: "7 Day Streak", earned: true },
		{ icon: "trophy", name: "10 Stories", earned: true },
		{ icon: "crown", name: "Story Master", earned: false },
	]
}: StreakTrackerProps) {
	const progress = (currentStreak / longestStreak) * 100;

	return (
		<Card className="p-8 rounded-3xl bg-gradient-to-br from-chart-1/5 to-chart-2/5 h-full flex flex-col" data-testid="card-streak-tracker">
			<div className="space-y-6 flex-1 flex flex-col">
				<div className="text-center">
					<div className="flex items-center justify-center gap-2 mb-2">
						<Flame className="w-8 h-8 text-chart-5 fill-chart-5" />
						<h3 className="text-3xl font-bold">Current Streak</h3>
					</div>
					<div className="text-6xl font-bold bg-gradient-to-r from-chart-5 to-chart-1 bg-clip-text text-transparent">
						{currentStreak} Days
					</div>
					<p className="text-lg text-muted-foreground mt-2">
						Longest: {longestStreak} days
					</p>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-sm font-medium">
						<span>Progress to next milestone</span>
						<span>{currentStreak}/14 days</span>
					</div>
					<Progress value={(currentStreak / 14) * 100} className="h-3" data-testid="progress-streak" />
				</div>

				<div>
					<h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
						<Trophy className="w-6 h-6 text-chart-3" />
						Achievements
					</h4>
					<div className="flex flex-wrap gap-3">
						{achievements.map((achievement, index) => {
							const IconComponent = achievementIcons[achievement.icon as keyof typeof achievementIcons] || Star;
							return (
								<Badge 
									key={index}
									variant={achievement.earned ? "default" : "secondary"}
									className={`px-4 py-2 text-base rounded-2xl ${
										!achievement.earned && "opacity-50 grayscale"
									}`}
									data-testid={`badge-achievement-${index}`}
								>
									<IconComponent className="w-4 h-4 mr-2" />
									{achievement.name}
								</Badge>
							);
						})}
					</div>
				</div>
			</div>
		</Card>
	);
}

