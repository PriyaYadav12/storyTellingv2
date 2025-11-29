import { useState, useEffect, useMemo } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, UserCircle, Zap, Book, Star, Plus } from "lucide-react";
import AdventureThemeCard from "./AdventureThemeCard";
import MoralLessonCard from "./MoralLessonCard";
import ChildForm from "./childForm";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getThemeMetadata, getLessonMetadata } from "@/lib/formConstant";


interface StoryGenerationFormProps {
	onGenerate?: (storyId: string) => void;
}


export default function StoryGenerationForm({ onGenerate }: StoryGenerationFormProps) {
	const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
	const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
	const [selectedLength, setSelectedLength] = useState<"short" | "medium" | "long">("short");
	const [selectedChild, setSelectedChild] = useState<"1" | "2">("1");
	const [useFavorites, setUseFavorites] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isChildFormOpen, setIsChildFormOpen] = useState(false);
	const [editingChild, setEditingChild] = useState<"1" | "2" | null>(null);

	const generateStoryText = useAction(api.generateStory.generateStoryText);
	const profile = useQuery(api.userProfiles.getProfile);
	const updateProfile = useMutation(api.userProfiles.updateProfile);
	const updateChild2 = useMutation(api.userProfiles.updateChild2);
	const _apiAny = api as any;
	const themeDocs = useQuery(_apiAny["migration/theme"]?.list);
	const lessonDocs = useQuery(_apiAny["migration/lesson"]?.list);

	// Check if user has multiple children
	const hasMultipleChildren = useMemo(() => {
		return !!(profile?.childName && profile?.child2Name);
	}, [profile]);

	// Check if user has at least one child
	const hasChildren = useMemo(() => {
		return !!profile?.childName;
	}, [profile]);

	const children = useMemo(() => {
		const childrenList: Array<{ id: "1" | "2"; name: string }> = [];
		if (profile?.childName) {
			childrenList.push({
				id: "1",
				name: profile.childName,
			});
		}
		if (profile?.child2Name) {
			childrenList.push({
				id: "2",
				name: profile.child2Name,
			});
		}
		return childrenList;
	}, [profile]);

	const themeOptions = useMemo(() => (themeDocs || []).map((t: any) => t.name as string), [themeDocs]);
	const lessonOptions = useMemo(() => (lessonDocs || []).map((l: any) => l.name as string), [lessonDocs]);

	useEffect(() => {
		// Auto-select first options once loaded
		if (!selectedTheme && themeOptions.length > 0) {
			setSelectedTheme(themeOptions[0]);
		}
		if (!selectedLesson && lessonOptions.length > 0) {
			setSelectedLesson(lessonOptions[0]);
		}
	}, [themeOptions, lessonOptions]);

	const handleGenerate = async () => {
		if (!selectedTheme || !selectedLanguage) {
			toast.error("Please select all required fields");
			return;
		}

		try {
			setIsGenerating(true);
			const { storyId } = await generateStoryText({
				params: {
					theme: selectedTheme.trim(),
					lesson: selectedLesson?.trim() || undefined,
					length: selectedLength,
					language: selectedLanguage,
					useFavorites,
					childId: hasMultipleChildren ? selectedChild : undefined,
				},
			});
			toast.success("Story is being generated!");
			onGenerate?.(storyId as unknown as string);
		} catch (e) {
			const msg =
				e instanceof Error
					? e.message
					: typeof e === "string"
					? e
					: "Failed to start generation";
			toast.error(msg);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<Card className="p-8 md:p-12 rounded-3xl w-full" data-testid="card-story-form">
			<div className="space-y-12">
				<div className="text-center space-y-2">
					<div className="flex items-center justify-center gap-3">
						<Sparkles className="w-10 h-10 text-primary" />
						<h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Create Your Next Adventure
						</h2>
					</div>
					<p className="text-xl text-muted-foreground">
						Choose a theme and a lesson to learn!
					</p>
				</div>

				<div className="space-y-6">
					{/* Child Selector - Show if at least one child */}
					{hasChildren && (
						<div className="space-y-3">
							<Label className="text-lg font-semibold flex items-center gap-2">
								<UserCircle className="w-5 h-5" />
								Select Adventurer
							</Label>
							<div className="inline-flex rounded-xl bg-muted p-1 border border-border">
								{children.map((child) => (
									<button
										key={child.id}
										type="button"
										onClick={() => setSelectedChild(child.id)}
										className={cn(
											"px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
											selectedChild === child.id
												? "bg-primary text-primary-foreground shadow-sm"
												: "text-muted-foreground hover:text-foreground"
										)}
									>
										{child.name}
									</button>
								))}
								{!hasMultipleChildren && (
									<button
										type="button"
										onClick={() => {
											setEditingChild("2");
											setIsChildFormOpen(true);
										}}
										className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground flex items-center gap-2"
									>
										<Plus className="w-4 h-4" />
										Add Child
									</button>
								)}
							</div>
						</div>
					)}

					{/* Story Length - Radio Buttons */}
					<div className="space-y-3">
						<Label className="text-lg font-semibold text-foreground/80">
							Story Length:
						</Label>
						{[
							{ value: "short" as const, label: "Quick Sparkle", time: "~2 min read", icon: Zap },
							{ value: "medium" as const, label: "Adventure Time", time: "~3 min read", icon: Star },
							{ value: "long" as const, label: "Epic Journey", time: "~5 min read", icon: Book },
						].map((option) => {
							const Icon = option.icon;
							return (
								<label
									key={option.value}
									className={cn(
										"flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
										selectedLength === option.value
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/50 bg-background"
									)}
								>
									<input
										type="radio"
										name="storyLength"
										value={option.value}
										checked={selectedLength === option.value}
										onChange={(e) => setSelectedLength(e.target.value as "short" | "medium" | "long")}
										className="w-5 h-5 text-primary border-2 border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
									/>
									<Icon className={cn(
										"w-5 h-5",
										selectedLength === option.value ? "text-primary" : "text-muted-foreground"
									)} />
									<div className="flex-1">
										<div className="font-medium">{option.label}</div>
										<div className="text-sm text-muted-foreground">{option.time}</div>
									</div>
								</label>
							);
						})}
					</div>

					{/* Language - Segmented Toggle */}
					<div className="space-y-3">
						<Label className="text-lg font-semibold text-foreground/80">
							Language:
						</Label>
						<div className="inline-flex rounded-xl bg-muted p-1 border border-border">
							<button
								type="button"
								onClick={() => setSelectedLanguage("English")}
								className={cn(
									"px-8 py-2.5 rounded-lg text-sm font-medium transition-all",
									selectedLanguage === "English"
										? "bg-primary text-primary-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								English
							</button>
							<button
								type="button"
								onClick={() => setSelectedLanguage("Hindi")}
								className={cn(
									"px-8 py-2.5 rounded-lg text-sm font-medium transition-all",
									selectedLanguage === "Hindi"
										? "bg-primary text-primary-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								Hindi
							</button>
						</div>
					</div>

					<div>
						<h3 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
							What kind of adventure today?
						</h3>
						<div className="grid grid-cols-3 md:grid-cols-5 gap-3">
							{themeOptions.map((themeName: string) => {
								const { icon, color } = getThemeMetadata(themeName);
								return (
									<AdventureThemeCard
										key={themeName}
										icon={icon}
										title={themeName}
										color={color}
										isSelected={selectedTheme === themeName}
										onClick={() => setSelectedTheme(themeName)}
									/>
								);
							})}
						</div>
					</div>

					<div>
						<h3 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
							What lesson should we learn?
						</h3>
						<div className="flex flex-wrap gap-3 justify-center md:justify-start">
							{lessonOptions.map((lessonName: string) => {
								const { icon } = getLessonMetadata(lessonName);
								return (
									<MoralLessonCard
										key={lessonName}
										icon={icon}
										title={lessonName}
										isSelected={selectedLesson === lessonName}
										onClick={() => setSelectedLesson(lessonName)}
									/>
								);
							})}
						</div>
					</div>

					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="useFavorites"
							checked={useFavorites}
							onChange={(e) => setUseFavorites(e.target.checked)}
							className="w-4 h-4"
						/>
						<Label htmlFor="useFavorites" className="text-sm cursor-pointer">
							Personalize with child's favorites
						</Label>
					</div>
				</div>

				<div className="flex justify-center pt-6">
					<Button
						size="lg"
						className="px-12 py-6 text-xl rounded-2xl font-semibold"
						onClick={handleGenerate}
						disabled={!selectedTheme || !selectedLesson || !selectedLanguage || isGenerating}
						data-testid="button-generate-story"
					>
						<Sparkles className="w-6 h-6 mr-3" />
						{isGenerating ? "Creating Your Story..." : "Generate My Story"}
					</Button>
				</div>
			</div>

			{/* Child Form Dialog */}
			<ChildForm
				isOpen={isChildFormOpen}
				onClose={() => {
					setIsChildFormOpen(false);
					setEditingChild(null);
				}}
				editingChild={editingChild}
				profile={profile}
				updateProfile={updateProfile}
				updateChild2={updateChild2}
			/>
		</Card>
	);
}

