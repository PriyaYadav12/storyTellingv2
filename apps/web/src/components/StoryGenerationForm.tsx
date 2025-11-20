import { useState, useEffect, useMemo } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Castle, Rocket, Waves, Rainbow, Palette, Trees, Home, Cookie, Globe, UserCircle } from "lucide-react";
import { Heart, Shield, Users, Smile, Brain, Target, Star, Lightbulb } from "lucide-react";
import AdventureThemeCard from "./AdventureThemeCard";
import MoralLessonCard from "./MoralLessonCard";
import { toast } from "sonner";

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
	const [useFavorites, setUseFavorites] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);

	const generateNow = useAction(api.storiesActions.generateNow);
	const _apiAny = api as any;
	const themeDocs = useQuery(_apiAny["migration/theme"]?.list);
	const lessonDocs = useQuery(_apiAny["migration/lesson"]?.list);

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
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<div className="space-y-2">
							<Label htmlFor="language" className="text-lg font-semibold flex items-center gap-2">
								<Globe className="w-5 h-5" />
								Language
							</Label>
							<Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
								<SelectTrigger id="language" className="text-base rounded-xl h-12" data-testid="select-language">
									<SelectValue placeholder="Select language" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="English">English</SelectItem>
									<SelectItem value="Hindi">Hindi (हिंदी)</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="length" className="text-lg font-semibold flex items-center gap-2">
								<Sparkles className="w-5 h-5" />
								Story Length
							</Label>
							<Select value={selectedLength} onValueChange={(v) => setSelectedLength(v as "short" | "medium" | "long")}>
								<SelectTrigger id="length" className="text-base rounded-xl h-12" data-testid="select-length">
									<SelectValue placeholder="Select length" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="short">Quick Sparkle (~2mins)</SelectItem>
									<SelectItem value="medium">Magical Journey (~3mins)</SelectItem>
									<SelectItem value="long">Dreamland Adventure (~5mins)</SelectItem>
								</SelectContent>
							</Select>
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

