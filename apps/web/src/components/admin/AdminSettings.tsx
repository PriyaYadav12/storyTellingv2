import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
	Plus, 
	Edit2, 
	Trash2, 
	Save, 
	X, 
	BookOpen, 
	GraduationCap,
	Layout,
	Sparkles,
	Target,
	Zap,
	Palette,
	Link as LinkIcon,
	Eye
} from "lucide-react";
import { toast } from "sonner";

export function AdminSettings() {
	return (
		<div className="space-y-6">
			{/* Editable Sections */}
			<EditableThemes />
			<EditableLessons />

			{/* Read-only Sections */}
			<ReadOnlyStructures />
			<ReadOnlyFlavorOpenings />
			<ReadOnlyFlavorEndings />
			<ReadOnlyFlavorPayoffs />
			<ReadOnlyFlavorObstacles />
			<ReadOnlyFlavorMagicalTriggers />
			<ReadOnlyThemeCompatibility />
		</div>
	);
}

// Editable Themes Component
function EditableThemes() {
	const themes = useQuery((api as any)["migration/theme"].list);
	const createTheme = useMutation((api as any)["migration/theme"].create);
	const updateTheme = useMutation((api as any)["migration/theme"].update);
	const deleteTheme = useMutation((api as any)["migration/theme"].remove);

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
			await createTheme({ name: newName.trim() });
			setNewName("");
			setIsAdding(false);
			toast.success("Theme added successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to add theme");
		}
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
					<div>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Themes
						</CardTitle>
						<CardDescription>Manage story themes (Editable)</CardDescription>
					</div>
					{!isAdding && (
						<Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
							<Plus className="h-4 w-4 mr-2" />
							Add Theme
						</Button>
					)}
				</div>
			</CardHeader>
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
										onClick={() => handleEdit(theme._id, theme.name)}
										size="sm"
										variant="ghost"
									>
										<Edit2 className="h-4 w-4" />
									</Button>
									<Button
										onClick={() => handleDelete(theme._id)}
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
		</Card>
	);
}

// Editable Lessons Component
function EditableLessons() {
	const lessons = useQuery((api as any)["migration/lesson"].list);
	const createLesson = useMutation((api as any)["migration/lesson"].create);
	const updateLesson = useMutation((api as any)["migration/lesson"].update);
	const deleteLesson = useMutation((api as any)["migration/lesson"].remove);

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
					<div>
						<CardTitle className="flex items-center gap-2">
							<GraduationCap className="h-5 w-5" />
							Lessons
						</CardTitle>
						<CardDescription>Manage story lessons (Editable)</CardDescription>
					</div>
					{!isAdding && (
						<Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
							<Plus className="h-4 w-4 mr-2" />
							Add Lesson
						</Button>
					)}
				</div>
			</CardHeader>
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
		</Card>
	);
}

// Read-only Components
function ReadOnlyStructures() {
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
				<CardTitle className="flex items-center gap-2">
					<Layout className="h-5 w-5" />
					Structures
				</CardTitle>
				<CardDescription className="flex items-center gap-2">
					<Eye className="h-4 w-4" />
					Read-only
				</CardDescription>
			</CardHeader>
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
		</Card>
	);
}

function ReadOnlyFlavorOpenings() {
	const openings = useQuery((api as any)["migration/flavor_openings"].list);

	if (openings === undefined) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Sparkles className="h-5 w-5" />
					Flavor Openings
				</CardTitle>
				<CardDescription className="flex items-center gap-2">
					<Eye className="h-4 w-4" />
					Read-only
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
					{openings.map((opening: any) => (
						<div key={opening._id} className="p-3 border rounded-lg">
							<Badge variant="outline" className="mb-2">{opening.code}</Badge>
							<p className="text-sm">{opening.description}</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function ReadOnlyFlavorEndings() {
	const endings = useQuery((api as any)["migration/flavor_endings"].list);

	if (endings === undefined) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Target className="h-5 w-5" />
					Flavor Endings
				</CardTitle>
				<CardDescription className="flex items-center gap-2">
					<Eye className="h-4 w-4" />
					Read-only
				</CardDescription>
			</CardHeader>
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
		</Card>
	);
}

function ReadOnlyFlavorPayoffs() {
	const payoffs = useQuery((api as any)["migration/flavor_payoffs"].list);

	if (payoffs === undefined) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Zap className="h-5 w-5" />
					Flavor Payoffs
				</CardTitle>
				<CardDescription className="flex items-center gap-2">
					<Eye className="h-4 w-4" />
					Read-only
				</CardDescription>
			</CardHeader>
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
		</Card>
	);
}

function ReadOnlyFlavorObstacles() {
	const obstacles = useQuery((api as any)["migration/flavor_obstacles"].list);

	if (obstacles === undefined) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Palette className="h-5 w-5" />
					Flavor Obstacles
				</CardTitle>
				<CardDescription className="flex items-center gap-2">
					<Eye className="h-4 w-4" />
					Read-only
				</CardDescription>
			</CardHeader>
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
		</Card>
	);
}

function ReadOnlyFlavorMagicalTriggers() {
	const triggers = useQuery((api as any)["migration/flavor_magical_triggers"].list);

	if (triggers === undefined) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Sparkles className="h-5 w-5" />
					Flavor Magical Triggers
				</CardTitle>
				<CardDescription className="flex items-center gap-2">
					<Eye className="h-4 w-4" />
					Read-only
				</CardDescription>
			</CardHeader>
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
		</Card>
	);
}

function ReadOnlyThemeCompatibility() {
	const compatibility = useQuery((api as any)["migration/theme_compatibility"].list);
	const themes = useQuery((api as any)["migration/theme"].list);

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

	const themeMap = new Map(themes.map((t: any) => [t._id, t.name]));
	const grouped = new Map<string, any[]>();

	for (const comp of compatibility) {
		const themeId = comp.themeId as any;
		const themeName = themeMap.get(themeId) || "Unknown";
		if (!grouped.has(themeName)) {
			grouped.set(themeName, []);
		}
		grouped.get(themeName)!.push(comp);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<LinkIcon className="h-5 w-5" />
					Theme Compatibility
				</CardTitle>
				<CardDescription className="flex items-center gap-2">
					<Eye className="h-4 w-4" />
					Read-only
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{Array.from(grouped.entries()).map(([themeName, comps]: [string, any[]]) => (
						<div key={themeName} className="p-4 border rounded-lg space-y-3">
							<h4 className="font-semibold">{themeName}</h4>
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
					))}
				</div>
			</CardContent>
		</Card>
	);
}
