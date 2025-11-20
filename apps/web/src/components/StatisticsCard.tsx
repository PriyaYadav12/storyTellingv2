import { Card } from "@/components/ui/card";
import { BookOpen, TrendingUp, Star, Award } from "lucide-react";

interface StatisticsCardProps {
	storiesCreated: number;
	readingTime: string;
	favoriteTheme: string;
	badgesEarned: number;
}

export default function StatisticsCard({
	storiesCreated,
	readingTime,
	favoriteTheme,
	badgesEarned,
}: StatisticsCardProps) {
	return (
		<Card className="p-8 rounded-3xl h-full flex flex-col" data-testid="card-statistics">
			<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
				Your Statistics
			</h2>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
				<div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/30 dark:to-purple-900/20 rounded-2xl p-6 space-y-3 flex flex-col items-center text-center">
					<div className="w-12 h-12 bg-purple-200 dark:bg-purple-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
						<BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
					</div>
					<div className="text-3xl font-bold">{storiesCreated}</div>
					<div className="text-sm text-muted-foreground">Stories Created</div>
				</div>

				<div className="bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-950/30 dark:to-pink-900/20 rounded-2xl p-6 space-y-3 flex flex-col items-center text-center">
					<div className="w-12 h-12 bg-pink-200 dark:bg-pink-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
						<TrendingUp className="w-6 h-6 text-pink-600 dark:text-pink-400" />
					</div>
					<div className="text-3xl font-bold">{readingTime}</div>
					<div className="text-sm text-muted-foreground">Minutes Reading</div>
				</div>

				<div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-2xl p-6 space-y-3 flex flex-col items-center text-center">
					<div className="w-12 h-12 bg-blue-200 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
						<Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
					</div>
					<div className="text-3xl font-bold break-words">{favoriteTheme}</div>
					<div className="text-sm text-muted-foreground">Favorite Theme</div>
				</div>

				<div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-950/30 dark:to-green-900/20 rounded-2xl p-6 space-y-3 flex flex-col items-center text-center">
					<div className="w-12 h-12 bg-green-200 dark:bg-green-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
						<Award className="w-6 h-6 text-green-600 dark:text-green-400" />
					</div>
					<div className="text-3xl font-bold">{badgesEarned}</div>
					<div className="text-sm text-muted-foreground">Badges Earned</div>
				</div>
			</div>
		</Card>
	);
}

