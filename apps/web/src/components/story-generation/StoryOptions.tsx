import { Label } from "@/components/ui/label";

interface StoryOptionsProps {
	useFavorites: boolean;
	textOnly: boolean;
	onUseFavoritesChange: (checked: boolean) => void;
	onTextOnlyChange: (checked: boolean) => void;
}

export default function StoryOptions({
	useFavorites,
	textOnly,
	onUseFavoritesChange,
	onTextOnlyChange,
}: StoryOptionsProps) {
	return (
		<>
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="useFavorites"
					checked={useFavorites}
					onChange={(e) => onUseFavoritesChange(e.target.checked)}
					className="w-4 h-4"
				/>
				<Label htmlFor="useFavorites" className="text-sm cursor-pointer">
					Personalize with child's favorites
				</Label>
			</div>
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="textOnly"
					checked={textOnly}
					onChange={(e) => onTextOnlyChange(e.target.checked)}
					className="w-4 h-4"
				/>
				<Label htmlFor="textOnly" className="text-sm cursor-pointer">
					Generate only text
				</Label>
			</div>
		</>
	);
}
