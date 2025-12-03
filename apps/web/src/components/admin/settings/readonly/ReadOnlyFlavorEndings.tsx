import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, ChevronDown, ChevronUp } from "lucide-react";

export function ReadOnlyFlavorEndings() {
	const [isExpanded, setIsExpanded] = useState(false);
	const endings = useQuery((api as any)["migration/flavor_endings"].list);

	if (endings === undefined) {
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
							<Target className="h-5 w-5" />
							Endings
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
					{endings.map((ending: any) => (
						<div key={ending._id} className="p-3 border rounded-lg">
							<Badge variant="outline" className="mb-2">{ending.code}</Badge>
							<p className="text-sm">{ending.description}</p>
						</div>
					))}
				</div>
			</CardContent>
			)}
		</Card>
	);
}
