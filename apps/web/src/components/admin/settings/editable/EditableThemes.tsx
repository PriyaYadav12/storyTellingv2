import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save, X, BookOpen, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { ThemeCompatibilityModal } from "../ThemeCompatibilityModal";
import type { Id } from "@story-telling-v2/backend/convex/_generated/dataModel";

export function EditableThemes() {
	const themes = useQuery((api as any)["migration/theme"].list);
	const createTheme = useMutation((api as any)["migration/theme"].create);
	const updateTheme = useMutation((api as any)["migration/theme"].update);
	const deleteTheme = useMutation((api as any)["migration/theme"].remove);

	const [isExpanded, setIsExpanded] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [newName, setNewName] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [compatibilityModalOpen, setCompatibilityModalOpen] = useState(false);
	const [selectedThemeForCompatibility, setSelectedThemeForCompatibility] = useState<{
		id: Id<"themes">;
		name: string;
		mode: "create" | "edit";
	} | null>(null);

	const handleEdit = (id: string, name: string) => {
		setEditingId(id);
		setEditName(name);
	};

	const handleSave = async (id: string) => {
		try {
			await updateTheme({ id: id as any, name: editName });
			setEditingId(null);
			setEditName("");
			toast.success("Theme updated successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to update theme");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this theme?")) return;
		try {
			await deleteTheme({ id: id as any });
			toast.success("Theme deleted successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to delete theme");
		}
	};

	const handleAdd = async () => {
		if (!newName.trim()) return;
		try {
			const themeId = await createTheme({ name: newName.trim() });
			setNewName("");
			setIsAdding(false);
			toast.success("Theme added successfully");
			// Open compatibility modal for the new theme
			setSelectedThemeForCompatibility({
				id: themeId as Id<"themes">,
				name: newName.trim(),
				mode: "create",
			});
			setCompatibilityModalOpen(true);
		} catch (error: any) {
			toast.error(error.message || "Failed to add theme");
		}
	};

	const handleEditCompatibility = (theme: any) => {
		setSelectedThemeForCompatibility({
			id: theme._id as Id<"themes">,
			name: theme.name,
			mode: "edit",
		});
		setCompatibilityModalOpen(true);
	};

	if (themes === undefined) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BookOpen className="h-5 w-5" />
						Themes
					</CardTitle>
					<CardDescription>Manage story themes</CardDescription>
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
							<BookOpen className="h-5 w-5" />
							Themes
							{isExpanded ? (
								<ChevronUp className="h-4 w-4 ml-1" />
							) : (
								<ChevronDown className="h-4 w-4 ml-1" />
							)}
						</CardTitle>
					</button>
					<div className="flex items-center gap-2">
						<CardDescription className="hidden sm:block">Manage story themes (Editable)</CardDescription>
						{!isAdding && isExpanded && (
							<Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
								<Plus className="h-4 w-4 mr-2" />
								Add Theme
							</Button>
						)}
					</div>
				</div>
			</CardHeader>
			{isExpanded && (
				<CardContent>
				<div className="space-y-3">
					{isAdding && (
						<div className="flex items-center gap-2 p-3 border rounded-lg">
							<Input
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder="Enter theme name"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleAdd();
									if (e.key === "Escape") {
										setIsAdding(false);
										setNewName("");
									}
								}}
								autoFocus
							/>
							<Button onClick={handleAdd} size="sm">
								<Save className="h-4 w-4" />
							</Button>
							<Button onClick={() => {
								setIsAdding(false);
								setNewName("");
							}} size="sm" variant="ghost">
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}
					{themes.map((theme: any) => (
						<div key={theme._id} className="flex items-center gap-2 p-3 border rounded-lg">
							{editingId === theme._id ? (
								<>
									<Input
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSave(theme._id);
											if (e.key === "Escape") {
												setEditingId(null);
												setEditName("");
											}
										}}
										autoFocus
										className="flex-1"
									/>
									<Button onClick={() => handleSave(theme._id)} size="sm">
										<Save className="h-4 w-4" />
									</Button>
									<Button onClick={() => {
										setEditingId(null);
										setEditName("");
									}} size="sm" variant="ghost">
										<X className="h-4 w-4" />
									</Button>
								</>
							) : (
								<>
									<span className="flex-1">{theme.name}</span>
									<Button
										onClick={() => handleEditCompatibility(theme)}
										size="sm"
										variant="ghost"
										title="Edit compatibility"
									>
										<LinkIcon className="h-4 w-4" />
									</Button>
									<Button
										onClick={() => handleEdit(theme._id, theme.name)}
										size="sm"
										variant="ghost"
										title="Edit theme name"
									>
										<Edit2 className="h-4 w-4" />
									</Button>
									<Button
										onClick={() => handleDelete(theme._id)}
										size="sm"
										variant="ghost"
										title="Delete theme"
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</>
							)}
						</div>
					))}
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
