import { useState, useEffect, useMemo } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card } from "@/components/ui/card";
import ChildForm from "./childForm";
import { toast } from "sonner";
import FormHeader from "./story-generation/FormHeader";
import ChildSelector from "./story-generation/ChildSelector";
import StoryLengthSelector from "./story-generation/StoryLengthSelector";
import LanguageSelector from "./story-generation/LanguageSelector";
import ThemeSelector from "./story-generation/ThemeSelector";
import LessonSelector from "./story-generation/LessonSelector";
import StoryOptions from "./story-generation/StoryOptions";
import GenerateButton from "./story-generation/GenerateButton";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

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
	const [textOnly, setTextOnly] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isChildFormOpen, setIsChildFormOpen] = useState(false);
	const [editingChild, setEditingChild] = useState<"1" | "2" | null>(null);

	const generateStoryText = useAction(api.generateStory.generateStoryText);
	const profile = useQuery(api.userProfiles.getProfile);
	const updateProfile = useMutation(api.userProfiles.updateProfile);
	const updateChild2 = useMutation(api.userProfiles.updateChild2);
	const credits = useQuery(api.credit.list);
	const navigate = useNavigate();
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

	// Calculate credit cost based on selected options
	const creditCost = useMemo(() => {
		// Text only costs 20 credits regardless of length
		if (textOnly) {
			return 20;
		}
		// Otherwise, base cost based on length
		if (selectedLength === "short") {
			return 60;
		} else if (selectedLength === "medium") {
			return 80;
		}
		return 0;
	}, [selectedLength, textOnly]);

	const availableCredits = credits?.[0]?.availableCredits || 0;

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

		if (selectedLength === "long") {
			toast.error("5-minute stories are locked. Upgrade to premium to unlock!");
			return;
		}

		if (availableCredits < creditCost) {
			toast.error(`Insufficient credits. You need ${creditCost} credits but only have ${availableCredits}.`);
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
					textOnly,
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

	const handleAddChild = () => {
		setEditingChild("2");
		setIsChildFormOpen(true);
	};

	const handleCloseChildForm = () => {
		setIsChildFormOpen(false);
		setEditingChild(null);
	};

	return (
		<Card className="p-8 md:p-12 rounded-3xl w-full" data-testid="card-story-form">
			<div className="space-y-12">
				<FormHeader />

				<div className="space-y-6">
					{hasChildren && (
						<ChildSelector
							children={children}
							selectedChild={selectedChild}
							hasMultipleChildren={hasMultipleChildren}
							onChildChange={setSelectedChild}
							onAddChild={handleAddChild}
						/>
					)}

					<StoryLengthSelector
						selectedLength={selectedLength}
						onLengthChange={setSelectedLength}
					/>

					<LanguageSelector
						selectedLanguage={selectedLanguage}
						onLanguageChange={setSelectedLanguage}
					/>

					<ThemeSelector
						themes={themeOptions}
						selectedTheme={selectedTheme}
						onThemeChange={setSelectedTheme}
					/>

					<LessonSelector
						lessons={lessonOptions}
						selectedLesson={selectedLesson}
						onLessonChange={setSelectedLesson}
					/>

					<StoryOptions
						useFavorites={useFavorites}
						textOnly={textOnly}
						onUseFavoritesChange={setUseFavorites}
						onTextOnlyChange={setTextOnly}
					/>
				</div>

				{availableCredits <= 20 ? (
					<div className="flex justify-center pt-6">
						<Button
							size="lg"
							className="px-12 py-6 text-xl rounded-2xl font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
							onClick={() => navigate({ to: "/pricing" })}
							data-testid="button-subscribe"
						>
							<Crown className="w-6 h-6 mr-3" />
							Subscribe to Generate Stories
						</Button>
					</div>
				) : (
					<GenerateButton
						isGenerating={isGenerating}
						creditCost={creditCost}
						onClick={handleGenerate}
						disabled={
							!selectedTheme ||
							!selectedLesson ||
							!selectedLanguage ||
							isGenerating ||
							availableCredits < creditCost
						}
					/>
				)}
			</div>

			<ChildForm
				isOpen={isChildFormOpen}
				onClose={handleCloseChildForm}
				editingChild={editingChild}
				profile={profile}
				updateProfile={updateProfile}
				updateChild2={updateChild2}
			/>
		</Card>
	);
}
