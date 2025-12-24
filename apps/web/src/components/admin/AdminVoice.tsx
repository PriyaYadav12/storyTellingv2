import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X, Volume2 } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@story-telling-v2/backend/convex/_generated/dataModel";

export function AdminVoice() {
	const voiceModels = useQuery((api as any)["migration/voice_models"].list);
	const updateVoiceModel = useMutation((api as any)["migration/voice_models"].update);

	const [editingId, setEditingId] = useState<string | null>(null);
	const [editVoiceId, setEditVoiceId] = useState("");

	const handleEdit = (id: string, voiceId: string) => {
		setEditingId(id);
		setEditVoiceId(voiceId);
	};

	const handleSave = async (id: string) => {
		if (!editVoiceId.trim()) {
			toast.error("Voice ID cannot be empty");
			return;
		}

		try {
			await updateVoiceModel({ 
				id: id as Id<"voice_models">, 
				voiceId: editVoiceId.trim() 
			});
			setEditingId(null);
			setEditVoiceId("");
			toast.success("Voice ID updated successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to update voice ID");
		}
	};

	const handleCancel = () => {
		setEditingId(null);
		setEditVoiceId("");
	};

	if (voiceModels === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (voiceModels.length === 0) {
		return (
			<div className="text-center py-12">
				<Volume2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-muted-foreground">No voice models found</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-4">
				{voiceModels.map((voice: any) => (
					<Card key={voice._id}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Volume2 className="h-5 w-5" />
								{voice.name}
							</CardTitle>
							<CardDescription>Voice Model Configuration</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground mb-2 block">
											Name
										</label>
										<div className="p-3 bg-muted/50 rounded-lg text-sm">
											{voice.name}
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											Name cannot be changed
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground mb-2 block">
											Voice ID
										</label>
										{editingId === voice._id ? (
											<div className="flex items-center gap-2">
												<Input
													value={editVoiceId}
													onChange={(e) => setEditVoiceId(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") handleSave(voice._id);
														if (e.key === "Escape") handleCancel();
													}}
													autoFocus
													className="flex-1"
													placeholder="Enter voice ID"
												/>
												<Button onClick={() => handleSave(voice._id)} size="sm">
													<Save className="h-4 w-4" />
												</Button>
												<Button onClick={handleCancel} size="sm" variant="ghost">
													<X className="h-4 w-4" />
												</Button>
											</div>
										) : (
											<div className="flex items-center gap-2">
												<div className="p-3 bg-muted/50 rounded-lg text-sm flex-1 font-mono">
													{voice.voiceId || "Not set"}
												</div>
												<Button
													onClick={() => handleEdit(voice._id, voice.voiceId || "")}
													size="sm"
													variant="outline"
													title="Edit voice ID"
												>
													<Edit2 className="h-4 w-4" />
												</Button>
											</div>
										)}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

