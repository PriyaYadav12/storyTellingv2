import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface GenerateButtonProps {
	isGenerating: boolean;
	creditCost: number;
	onClick: () => void;
	disabled?: boolean;
}

export default function GenerateButton({
	isGenerating,
	creditCost,
	onClick,
	disabled = false,
}: GenerateButtonProps) {
	return (
		<div className="flex justify-center pt-6">
			<Button
				size="lg"
				className="px-12 py-6 text-xl rounded-2xl font-semibold"
				onClick={onClick}
				disabled={disabled}
				data-testid="button-generate-story"
			>
				<Sparkles className="w-6 h-6 mr-3" />
				{isGenerating ? "Creating Your Story..." : "Generate My Story"}
				{creditCost > 0 && (
					<span className="ml-3 text-sm font-normal opacity-90">
						({creditCost} credits)
					</span>
				)}
			</Button>
		</div>
	);
}
