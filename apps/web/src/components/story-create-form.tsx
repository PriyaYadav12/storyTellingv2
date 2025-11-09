import { useEffect, useMemo, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Props = {
	onStoryGenerated?: (storyId: string) => void;
};

export default function StoryCreateForm({ onStoryGenerated }: Props) {
	const [theme, setTheme] = useState("");
	const [lesson, setLesson] = useState("");
	const [length, setLength] = useState<"short" | "medium" | "long">("short");
	const [language, setLanguage] = useState("English");
	const [useFavorites, setUseFavorites] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const generateNow = useAction(api.storiesActions.generateNow);
	// Cast to any to access path-based convex modules like "migration/theme"
	const _apiAny = api as any;
	const themeDocs = useQuery(_apiAny["migration/theme"].list);
	const lessonDocs = useQuery(_apiAny["migration/lesson"].list);

	const themeOptions = useMemo(() => (themeDocs || []).map((t: any) => t.name as string), [themeDocs]);
	const lessonOptions = useMemo(() => (lessonDocs || []).map((l: any) => l.name as string), [lessonDocs]);

	useEffect(() => {
		// Auto-select first options once loaded (mobile-friendly, fewer taps)
		if (!theme && themeOptions.length > 0) setTheme(themeOptions[0]);
		if (!lesson && lessonOptions.length > 0) setLesson(lessonOptions[0]);
	}, [themeOptions, lessonOptions]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setIsSubmitting(true);
			const { storyId } = await generateNow({
				params: {
					theme: theme.trim(),
					lesson: lesson.trim(),
					length,
					language,
					useFavorites,
				},
			});
			toast.success("Story is generated!");
			onStoryGenerated?.(storyId as unknown as string);
			setIsSubmitting(false);
		} catch (e) {
			setIsSubmitting(false);
			const msg =
				e instanceof Error
					? e.message
					: typeof e === "string"
					? e
					: "Failed to start generation";
			toast.error(msg);
		}
	};

	return (
		<Card className="border-2">
			<CardHeader>
				<CardTitle>Create a Story</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
						<div>
							<label className="block text-sm font-medium mb-1">Theme</label>
							<select
								className="w-full p-2 border rounded"
								value={theme}
								onChange={(e) => setTheme(e.target.value)}
								disabled={themeDocs === undefined}
							>
								{themeOptions.map((name: string) => (
									<option key={name} value={name}>
										{name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Lesson</label>
							<select
								className="w-full p-2 border rounded"
								value={lesson}
								onChange={(e) => setLesson(e.target.value)}
								disabled={lessonDocs === undefined}
							>
								{lessonOptions.map((name: string) => (
									<option key={name} value={name}>
										{name}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-2">
						<div>
							<label className="block text-sm font-medium mb-1">Length</label>
							<select
								className="w-full p-2 border rounded"
								value={length}
								onChange={(e) => setLength(e.target.value as any)}
							>
								<option value="short">Quick Sparkle (~2mins)</option>
								<option value="medium">Magical Journey (~3mins)</option>
								<option value="long">Dreamland Adventure (~5mins)</option>
							</select>
						</div>
						<div className="col-span-2">
							<label className="block text-sm font-medium mb-1">Language</label>
							<select
								className="w-full p-2 border rounded"
								value={language}
								onChange={(e) => setLanguage(e.target.value)}
							>
								<option>English</option>
								<option>Hindi</option>
							</select>
						</div>
					</div>
					<label className="inline-flex items-center gap-2">
						<input
							type="checkbox"
							checked={useFavorites}
							onChange={(e) => setUseFavorites(e.target.checked)}
						/>
						<span className="text-sm">Personalize with child's favorites</span>
					</label>
					<div className="pt-2">
					<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Generating..." : "Generate ✨"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}