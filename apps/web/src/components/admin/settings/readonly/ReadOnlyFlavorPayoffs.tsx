import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Eye, ChevronDown, ChevronUp } from "lucide-react";

export function ReadOnlyFlavorPayoffs() {
	const [isExpanded, setIsExpanded] = useState(false);
	const payoffs = useQuery((api as any)["migration/flavor_payoffs"].list);

	if (payoffs === undefined) {
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
							<Zap className="h-5 w-5" />
							Payoffs
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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
					{payoffs.map((payoff: any) => (
						<div key={payoff._id} className="p-3 border rounded-lg">
							<Badge variant="outline" className="mb-2">{payoff.code}</Badge>
							<p className="text-sm">{payoff.description}</p>
						</div>
					))}
				</div>
			</CardContent>
			)}
		</Card>
	);
}
