import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Eye, ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import { ThemeCompatibilityModal } from "../ThemeCompatibilityModal";
import type { Id } from "@story-telling-v2/backend/convex/_generated/dataModel";

export function ReadOnlyThemeCompatibility() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [compatibilityModalOpen, setCompatibilityModalOpen] = useState(false);
	const [selectedThemeForCompatibility, setSelectedThemeForCompatibility] = useState<{
		id: Id<"themes">;
		name: string;
		mode: "edit";
	} | null>(null);
	const compatibility = useQuery((api as any)["migration/theme_compatibility"].list);
	const themes = useQuery((api as any)["migration/theme"].list);

	const handleEditCompatibility = (themeId: string, themeName: string) => {
		setSelectedThemeForCompatibility({
			id: themeId as Id<"themes">,
			name: themeName,
			mode: "edit",
		});
		setCompatibilityModalOpen(true);
	};

	if (compatibility === undefined || themes === undefined) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LinkIcon className="h-5 w-5" />
						Theme Compatibility
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

	const themeMap = new Map<string, string>(themes.map((t: any) => [String(t._id), t.name]));
	const grouped = new Map<string, any[]>();

	for (const comp of compatibility) {
		const themeId = String((comp.themeId as any) || "");
		const themeName = (themeMap.get(themeId) || "Unknown") as string;
		if (!grouped.has(themeName)) {
			grouped.set(themeName, []);
		}
		grouped.get(themeName)!.push(comp);
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
							<LinkIcon className="h-5 w-5" />
							Theme Compatibility
							{isExpanded ? (
								<ChevronUp className="h-4 w-4 ml-1" />
							) : (
								<ChevronDown className="h-4 w-4 ml-1" />
							)}
						</CardTitle>
					</button>
					<CardDescription className="flex items-center gap-2">
						<Eye className="h-4 w-4" />
						View compatibility
					</CardDescription>
				</div>
			</CardHeader>
			{isExpanded && (
				<CardContent>
				<div className="space-y-4">
					{Array.from(grouped.entries()).map(([themeName, comps]: [string, any[]]) => {
						const themeId = themes.find((t: any) => t.name === themeName)?._id;
						return (
							<div key={themeName} className="p-4 border rounded-lg space-y-3">
								<div className="flex items-center justify-between">
									<h4 className="font-semibold">{themeName}</h4>
									{themeId && (
										<Button
											onClick={() => handleEditCompatibility(themeId, themeName)}
											size="sm"
											variant="outline"
										>
											<Edit2 className="h-4 w-4 mr-2" />
											Edit
										</Button>
									)}
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
									{comps.map((comp: any) => (
										<div key={comp._id} className="p-3 bg-muted/50 rounded-lg space-y-2">
											<Badge variant="outline">{comp.category}</Badge>
											<div className="flex flex-wrap gap-1">
												{comp.allowedCodes.map((code: string, idx: number) => (
													<Badge key={idx} variant="secondary" className="text-xs">
														{code}
													</Badge>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
			)}
			{selectedThemeForCompatibility && (
				<ThemeCompatibilityModal
					open={compatibilityModalOpen}
					onOpenChange={setCompatibilityModalOpen}
					themeId={selectedThemeForCompatibility.id}
					themeName={selectedThemeForCompatibility.name}
					mode={selectedThemeForCompatibility.mode}
				/>
			)}
		</Card>
	);
}
