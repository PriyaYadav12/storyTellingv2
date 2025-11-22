import { useState, useEffect, useMemo } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Castle, Rocket, Waves, Rainbow, Palette, Trees, Home, Cookie, Globe, UserCircle, Zap, Book } from "lucide-react";
import { Heart, Shield, Users, Smile, Brain, Target, Star, Lightbulb } from "lucide-react";
import AdventureThemeCard from "./AdventureThemeCard";
import MoralLessonCard from "./MoralLessonCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const adventures = [
	{ id: "castle", icon: Castle, title: "Castle Adventure", color: "pink" as const },
	{ id: "space", icon: Rocket, title: "Space Adventure", color: "blue" as const },
	{ id: "ocean", icon: Waves, title: "Ocean Quest", color: "blue" as const },
	{ id: "rainbow", icon: Rainbow, title: "Rainbow Valley", color: "purple" as const },
	{ id: "art", icon: Palette, title: "Art Studio", color: "yellow" as const },
	{ id: "nature", icon: Trees, title: "Nature Garden", color: "green" as const },
	{ id: "building", icon: Home, title: "Building Workshop", color: "purple" as const },
	{ id: "bakery", icon: Cookie, title: "Bakery Magic", color: "pink" as const },
];

const lessons = [
	{ id: "kindness", icon: Heart, title: "Kindness" },
	{ id: "courage", icon: Shield, title: "Courage" },
	{ id: "teamwork", icon: Users, title: "Teamwork" },
	{ id: "honesty", icon: Smile, title: "Honesty" },
	{ id: "problem-solving", icon: Brain, title: "Problem Solving" },
	{ id: "perseverance", icon: Target, title: "Perseverance" },
	{ id: "creativity", icon: Star, title: "Creativity" },
	{ id: "empathy", icon: Lightbulb, title: "Empathy" },
];

interface StoryGenerationFormProps {
	onGenerate?: (storyId: string) => void;
}

export default function StoryGenerationForm({ onGenerate }: StoryGenerationFormProps) {
	const [selectedAdventure, setSelectedAdventure] = useState<string | null>(null);
	const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
	const [selectedLength, setSelectedLength] = useState<"short" | "medium" | "long">("short");
	const [selectedChild, setSelectedChild] = useState<"1" | "2">("1");
	const [useFavorites, setUseFavorites] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);

	const generateNow = useAction(api.storiesActions.generateNow);
	const profile = useQuery(api.userProfiles.getProfile);
	const _apiAny = api as any;
	const themeDocs = useQuery(_apiAny["migration/theme"]?.list);
	const lessonDocs = useQuery(_apiAny["migration/lesson"]?.list);

	// Check if user has multiple children
	const hasMultipleChildren = useMemo(() => {
		return !!(profile?.childName && profile?.child2Name);
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

	// Map adventure IDs to theme names from backend
	const getThemeName = (adventureId: string | null) => {
		if (!adventureId) return null;
		const adventure = adventures.find(a => a.id === adventureId);
		if (!adventure) return null;
		// Try to match with backend theme names
		const themeName = adventure.title.replace(" Adventure", "").replace(" Quest", "").replace(" Valley", "").replace(" Studio", "").replace(" Garden", "").replace(" Workshop", "").replace(" Magic", "");
		return themeOptions.find((t: string) => t.toLowerCase().includes(themeName.toLowerCase())) || themeOptions[0] || null;
	};

	// Map lesson IDs to lesson names from backend
	const getLessonName = (lessonId: string | null) => {
		if (!lessonId) return null;
		const lesson = lessons.find(l => l.id === lessonId);
		if (!lesson) return null;
		return lessonOptions.find((l: string) => l.toLowerCase().includes(lesson.title.toLowerCase())) || lessonOptions[0] || null;
	};

	useEffect(() => {
		// Auto-select first options once loaded
		if (!selectedAdventure && themeOptions.length > 0) {
			const firstTheme = themeOptions[0];
			const matchingAdventure = adventures.find(a => 
				firstTheme.toLowerCase().includes(a.title.toLowerCase().split(" ")[0])
			);
			if (matchingAdventure) {
				setSelectedAdventure(matchingAdventure.id);
			}
		}
		if (!selectedLesson && lessonOptions.length > 0) {
			const firstLesson = lessonOptions[0];
			const matchingLesson = lessons.find(l => 
				firstLesson.toLowerCase().includes(l.title.toLowerCase())
			);
			if (matchingLesson) {
				setSelectedLesson(matchingLesson.id);
			}
		}
	}, [themeOptions, lessonOptions]);

	const handleGenerate = async () => {
		const theme = getThemeName(selectedAdventure);
		const lesson = getLessonName(selectedLesson);

		if (!theme || !lesson || !selectedLanguage) {
			toast.error("Please select all required fields");
			return;
		}

		try {
			setIsGenerating(true);
			const { storyId } = await generateNow({
				params: {
					theme: theme.trim(),
					lesson: lesson.trim(),
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
					{/* Child Selector - Only show if multiple children */}
					{hasMultipleChildren && (
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
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{adventures.map((adventure) => (
								<AdventureThemeCard
									key={adventure.id}
									icon={adventure.icon}
									title={adventure.title}
									color={adventure.color}
									isSelected={selectedAdventure === adventure.id}
									onClick={() => setSelectedAdventure(adventure.id)}
								/>
							))}
						</div>
					</div>

					<div>
						<h3 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
							What lesson should we learn?
						</h3>
						<div className="flex flex-wrap gap-3 justify-center md:justify-start">
							{lessons.map((lesson) => (
								<MoralLessonCard
									key={lesson.id}
									icon={lesson.icon}
									title={lesson.title}
									isSelected={selectedLesson === lesson.id}
									onClick={() => setSelectedLesson(lesson.id)}
								/>
							))}
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
						disabled={!selectedAdventure || !selectedLesson || !selectedLanguage || isGenerating}
						data-testid="button-generate-story"
					>
						<Sparkles className="w-6 h-6 mr-3" />
						{isGenerating ? "Creating Your Story..." : "Generate My Story"}
					</Button>
				</div>
			</div>
		</Card>
	);
}

