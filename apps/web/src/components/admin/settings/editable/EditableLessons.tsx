import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save, X, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export function EditableLessons() {
	const lessons = useQuery((api as any)["migration/lesson"].list);
	const createLesson = useMutation((api as any)["migration/lesson"].create);
	const updateLesson = useMutation((api as any)["migration/lesson"].update);
	const deleteLesson = useMutation((api as any)["migration/lesson"].remove);

	const [isExpanded, setIsExpanded] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [newName, setNewName] = useState("");
	const [isAdding, setIsAdding] = useState(false);

	const handleEdit = (id: string, name: string) => {
		setEditingId(id);
		setEditName(name);
	};

	const handleSave = async (id: string) => {
		try {
			await updateLesson({ id: id as any, name: editName });
			setEditingId(null);
			setEditName("");
			toast.success("Lesson updated successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to update lesson");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this lesson?")) return;
		try {
			await deleteLesson({ id: id as any });
			toast.success("Lesson deleted successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to delete lesson");
		}
	};

	const handleAdd = async () => {
		if (!newName.trim()) return;
		try {
			await createLesson({ name: newName.trim() });
			setNewName("");
			setIsAdding(false);
			toast.success("Lesson added successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to add lesson");
		}
	};

	if (lessons === undefined) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<GraduationCap className="h-5 w-5" />
						Lessons
					</CardTitle>
					<CardDescription>Manage story lessons</CardDescription>
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
							<GraduationCap className="h-5 w-5" />
							Lessons
							{isExpanded ? (
								<ChevronUp className="h-4 w-4 ml-1" />
							) : (
								<ChevronDown className="h-4 w-4 ml-1" />
							)}
						</CardTitle>
					</button>
					<div className="flex items-center gap-2">
						<CardDescription className="hidden sm:block">Manage story lessons (Editable)</CardDescription>
						{!isAdding && isExpanded && (
							<Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
								<Plus className="h-4 w-4 mr-2" />
								Add Lesson
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
								placeholder="Enter lesson name"
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
					{lessons.map((lesson: any) => (
						<div key={lesson._id} className="flex items-center gap-2 p-3 border rounded-lg">
							{editingId === lesson._id ? (
								<>
									<Input
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSave(lesson._id);
											if (e.key === "Escape") {
												setEditingId(null);
												setEditName("");
											}
										}}
										autoFocus
										className="flex-1"
									/>
									<Button onClick={() => handleSave(lesson._id)} size="sm">
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
									<span className="flex-1">{lesson.name}</span>
									<Button
										onClick={() => handleEdit(lesson._id, lesson.name)}
										size="sm"
										variant="ghost"
									>
										<Edit2 className="h-4 w-4" />
									</Button>
									<Button
										onClick={() => handleDelete(lesson._id)}
										size="sm"
										variant="ghost"
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
		</Card>
	);
}
