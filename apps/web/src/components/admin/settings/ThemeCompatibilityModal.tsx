import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Id } from "@story-telling-v2/backend/convex/_generated/dataModel";

interface ThemeCompatibilityModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	themeId: Id<"themes"> | null;
	themeName: string;
	mode?: "create" | "edit";
}

export function ThemeCompatibilityModal({
	open,
	onOpenChange,
	themeId,
	themeName,
	mode = "edit",
}: ThemeCompatibilityModalProps) {
	const openings = useQuery((api as any)["migration/flavor_openings"].list);
	const triggers = useQuery((api as any)["migration/flavor_magical_triggers"].list);
	const obstacles = useQuery((api as any)["migration/flavor_obstacles"].list);
	const compatibility = useQuery(
		(api as any)["migration/theme_compatibility"].getByTheme,
		themeId ? { themeId } : "skip"
	);
	const updateCompatibility = useMutation((api as any)["migration/theme_compatibility"].updateForTheme);

	const [selectedOpenings, setSelectedOpenings] = useState<string[]>([]);
	const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
	const [selectedObstacles, setSelectedObstacles] = useState<string[]>([]);

	// Initialize selections from compatibility data
	useEffect(() => {
		if (compatibility && compatibility.length > 0) {
			const openingsComp = compatibility.find((c: any) => c.category === "OP");
			const triggersComp = compatibility.find((c: any) => c.category === "MT");
			const obstaclesComp = compatibility.find((c: any) => c.category === "OB");

			setSelectedOpenings(openingsComp?.allowedCodes || []);
			setSelectedTriggers(triggersComp?.allowedCodes || []);
			setSelectedObstacles(obstaclesComp?.allowedCodes || []);
		} else if (mode === "create") {
			// For new themes, start with empty selections
			setSelectedOpenings([]);
			setSelectedTriggers([]);
			setSelectedObstacles([]);
		}
	}, [compatibility, mode]);

	const handleToggleOpening = (code: string) => {
		setSelectedOpenings((prev) =>
			prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
		);
	};

	const handleToggleTrigger = (code: string) => {
		setSelectedTriggers((prev) =>
			prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
		);
	};

	const handleToggleObstacle = (code: string) => {
		setSelectedObstacles((prev) =>
			prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
		);
	};

	const handleSave = async () => {
		if (!themeId) {
			toast.error("Theme ID is required");
			return;
		}

		try {
			await updateCompatibility({
				themeId,
				openings: selectedOpenings,
				triggers: selectedTriggers,
				obstacles: selectedObstacles,
			});
			toast.success("Compatibility updated successfully");
			onOpenChange(false);
		} catch (error: any) {
			toast.error(error.message || "Failed to update compatibility");
		}
	};

	const isLoading = openings === undefined || triggers === undefined || obstacles === undefined;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Set Theme Compatibility" : "Edit Theme Compatibility"}
					</DialogTitle>
					<DialogDescription>
						Select compatible openings, triggers, and obstacles for <strong>{themeName}</strong>.
						Payoffs and endings are automatically included for all themes.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : (
					<div className="space-y-6 py-4">
						{/* Openings Section */}
						<div className="space-y-3">
							<Label className="text-base font-semibold">Openings</Label>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 border rounded-lg">
								{openings?.map((opening: any) => (
									<div key={opening._id} className="flex items-center space-x-2">
										<Checkbox
											id={`opening-${opening.code}`}
											checked={selectedOpenings.includes(opening.code)}
											onCheckedChange={() => handleToggleOpening(opening.code)}
										/>
										<label
											htmlFor={`opening-${opening.code}`}
											className="flex-1 cursor-pointer text-sm"
										>
											<div className="flex items-center gap-2">
												<Badge variant="outline" className="text-xs">
													{opening.code}
												</Badge>
												<span>{opening.description}</span>
											</div>
										</label>
									</div>
								))}
							</div>
						</div>

						{/* Triggers Section */}
						<div className="space-y-3">
							<Label className="text-base font-semibold">Magical Triggers</Label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg">
								{triggers?.map((trigger: any) => (
									<div key={trigger._id} className="flex items-start space-x-2">
										<Checkbox
											id={`trigger-${trigger.code}`}
											checked={selectedTriggers.includes(trigger.code)}
											onCheckedChange={() => handleToggleTrigger(trigger.code)}
											className="mt-1"
										/>
										<label
											htmlFor={`trigger-${trigger.code}`}
											className="flex-1 cursor-pointer text-sm"
										>
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<Badge variant="outline" className="text-xs">
														{trigger.code}
													</Badge>
													<span className="font-medium">{trigger.description}</span>
												</div>
												{trigger.keywords && trigger.keywords.length > 0 && (
													<div className="flex flex-wrap gap-1 ml-6">
														{trigger.keywords.slice(0, 3).map((keyword: string, idx: number) => (
															<Badge key={idx} variant="secondary" className="text-xs">
																{keyword}
															</Badge>
														))}
														{trigger.keywords.length > 3 && (
															<Badge variant="secondary" className="text-xs">
																+{trigger.keywords.length - 3} more
															</Badge>
														)}
													</div>
												)}
											</div>
										</label>
									</div>
								))}
							</div>
						</div>

						{/* Obstacles Section */}
						<div className="space-y-3">
							<Label className="text-base font-semibold">Obstacles</Label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg">
								{obstacles?.map((obstacle: any) => (
									<div key={obstacle._id} className="flex items-start space-x-2">
										<Checkbox
											id={`obstacle-${obstacle.code}`}
											checked={selectedObstacles.includes(obstacle.code)}
											onCheckedChange={() => handleToggleObstacle(obstacle.code)}
											className="mt-1"
										/>
										<label
											htmlFor={`obstacle-${obstacle.code}`}
											className="flex-1 cursor-pointer text-sm"
										>
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<Badge variant="outline" className="text-xs">
														{obstacle.code}
													</Badge>
													<span className="font-medium">{obstacle.description}</span>
												</div>
												{obstacle.exampleContext && obstacle.exampleContext.length > 0 && (
													<div className="flex flex-wrap gap-1 ml-6">
														{obstacle.exampleContext.slice(0, 2).map((ctx: string, idx: number) => (
															<Badge key={idx} variant="secondary" className="text-xs">
																{ctx}
															</Badge>
														))}
														{obstacle.exampleContext.length > 2 && (
															<Badge variant="secondary" className="text-xs">
																+{obstacle.exampleContext.length - 2} more
															</Badge>
														)}
													</div>
												)}
											</div>
										</label>
									</div>
								))}
							</div>
						</div>

						{/* Info about Payoffs and Endings */}
						<div className="p-3 bg-muted/50 rounded-lg">
							<p className="text-sm text-muted-foreground">
								<strong>Note:</strong> Payoffs and endings are automatically included for all themes
								and cannot be customized per theme.
							</p>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!themeId || isLoading}>
						Save Compatibility
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
