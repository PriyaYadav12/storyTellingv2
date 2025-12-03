import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Eye, ChevronDown, ChevronUp } from "lucide-react";

export function ReadOnlyFlavorMagicalTriggers() {
	const [isExpanded, setIsExpanded] = useState(false);
	const triggers = useQuery((api as any)["migration/flavor_magical_triggers"].list);

	if (triggers === undefined) {
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
							<Sparkles className="h-5 w-5" />
							Magical Triggers
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
					{triggers.map((trigger: any) => (
						<div key={trigger._id} className="p-4 border rounded-lg space-y-2">
							<div className="flex items-center gap-2">
								<Badge variant="outline">{trigger.code}</Badge>
								<span className="font-semibold">{trigger.description}</span>
							</div>
							{trigger.keywords && trigger.keywords.length > 0 && (
								<div>
									<p className="text-xs text-muted-foreground mb-1">Keywords:</p>
									<div className="flex flex-wrap gap-1">
										{trigger.keywords.map((keyword: string, idx: number) => (
											<Badge key={idx} variant="secondary">{keyword}</Badge>
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
