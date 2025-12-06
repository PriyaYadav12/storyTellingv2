import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
	selectedLanguage: string;
	onLanguageChange: (language: string) => void;
	languages?: string[];
}

const defaultLanguages = ["English", "Hindi"];

export default function LanguageSelector({
	selectedLanguage,
	onLanguageChange,
	languages = defaultLanguages,
}: LanguageSelectorProps) {
	return (
		<div className="space-y-3">
			<Label className="text-lg font-semibold text-foreground/80">
				Language:
			</Label>
			<div className="inline-flex rounded-xl bg-muted p-1 border border-border">
				{languages.map((language) => (
					<button
						key={language}
						type="button"
						onClick={() => onLanguageChange(language)}
						className={cn(
							"px-8 py-2.5 rounded-lg text-sm font-medium transition-all",
							selectedLanguage === language
								? "bg-primary text-primary-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						{language}
					</button>
				))}
			</div>
		</div>
	);
}
