import AdventureThemeCard from "../AdventureThemeCard";
import { getThemeMetadata } from "@/lib/formConstant";

interface ThemeSelectorProps {
	themes: string[];
	selectedTheme: string | null;
	onThemeChange: (theme: string) => void;
}

export default function ThemeSelector({
	themes,
	selectedTheme,
	onThemeChange,
}: ThemeSelectorProps) {
	return (
		<div>
			<h3 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
				What kind of adventure today?
			</h3>
			<div className="grid grid-cols-3 md:grid-cols-5 gap-3">
				{themes.map((themeName: string) => {
					const { icon, color } = getThemeMetadata(themeName);
					return (
						<AdventureThemeCard
							key={themeName}
							icon={icon}
							title={themeName}
							color={color}
							isSelected={selectedTheme === themeName}
							onClick={() => onThemeChange(themeName)}
						/>
					);
				})}
			</div>
		</div>
	);
}
