import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout, Eye, ChevronDown, ChevronUp } from "lucide-react";

export function ReadOnlyStructures() {
	const [isExpanded, setIsExpanded] = useState(false);
	const structures = useQuery((api as any)["migration/structure"].list);

	if (structures === undefined) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Layout className="h-5 w-5" />
						Structures
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				</CardContent>
			</Card>
		);
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
							<Layout className="h-5 w-5" />
							Structures
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
					{structures.map((structure: any) => (
						<div key={structure._id} className="p-4 border rounded-lg space-y-2">
							<div className="flex items-center gap-2">
								<Badge variant="outline">{structure.code}</Badge>
								<span className="font-semibold">{structure.name}</span>
							</div>
							{structure.useFor && (
								<p className="text-sm text-muted-foreground">{structure.useFor}</p>
							)}
							<div className="flex flex-wrap gap-2">
								{structure.pattern.map((step: string, idx: number) => (
									<Badge key={idx} variant="secondary">
										{idx + 1}. {step}
									</Badge>
								))}
							</div>
						</div>
					))}
				</div>
			</CardContent>
			)}
		</Card>
	);
}
