import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Eye, ChevronDown, ChevronUp } from "lucide-react";

export function ReadOnlyFlavorObstacles() {
	const [isExpanded, setIsExpanded] = useState(false);
	const obstacles = useQuery((api as any)["migration/flavor_obstacles"].list);

	if (obstacles === undefined) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1 text-left"
					>
						<CardTitle className="flex items-center gap-2">
							<Palette className="h-5 w-5" />
							Obstacles
							{isExpanded ? (
								<ChevronUp className="h-4 w-4 ml-1" />
							) : (
								<ChevronDown className="h-4 w-4 ml-1" />
							)}
						</CardTitle>
					</button>
					<CardDescription className="flex items-center gap-2">
						<Eye className="h-4 w-4" />
						Read-only
					</CardDescription>
				</div>
			</CardHeader>
			{isExpanded && (
				<CardContent>
				<div className="space-y-3">
					{obstacles.map((obstacle: any) => (
						<div key={obstacle._id} className="p-4 border rounded-lg space-y-2">
							<div className="flex items-center gap-2">
								<Badge variant="outline">{obstacle.code}</Badge>
								<span className="font-semibold">{obstacle.description}</span>
							</div>
							{obstacle.exampleContext && obstacle.exampleContext.length > 0 && (
								<div>
									<p className="text-xs text-muted-foreground mb-1">Example Context:</p>
									<div className="flex flex-wrap gap-1">
										{obstacle.exampleContext.map((ctx: string, idx: number) => (
											<Badge key={idx} variant="secondary">{ctx}</Badge>
										))}
									</div>
								</div>
							)}
							{obstacle.solutions && obstacle.solutions.length > 0 && (
								<div>
									<p className="text-xs text-muted-foreground mb-1">Solutions:</p>
									<div className="flex flex-wrap gap-1">
										{obstacle.solutions.map((sol: string, idx: number) => (
											<Badge key={idx} variant="outline">{sol}</Badge>
										))}
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</CardContent>
			)}
		</Card>
	);
}
