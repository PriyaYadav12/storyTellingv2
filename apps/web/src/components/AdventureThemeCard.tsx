import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface AdventureThemeCardProps {
	icon: LucideIcon;
	title: string;
	isSelected?: boolean;
	onClick?: () => void;
	color?: "pink" | "blue" | "yellow" | "purple" | "green";
}

const colorClasses = {
	pink: "bg-chart-1/10 text-chart-1 border-chart-1",
	blue: "bg-chart-2/10 text-chart-2 border-chart-2", 
	yellow: "bg-chart-3/10 text-chart-3 border-chart-3",
	purple: "bg-chart-4/10 text-chart-4 border-chart-4",
	green: "bg-chart-5/10 text-chart-5 border-chart-5",
};

export default function AdventureThemeCard({ 
	icon: Icon, 
	title, 
	isSelected = false, 
	onClick,
	color = "pink" 
}: AdventureThemeCardProps) {
	return (
		<Card
			className={`
				p-4 rounded-2xl cursor-pointer transition-all
				hover:shadow-lg active:scale-95
				${isSelected ? `border-3 ${colorClasses[color]}` : "border-2 border-transparent"}
			`}
			onClick={onClick}
			data-testid={`card-theme-${title.toLowerCase().replace(/\s+/g, '-')}`}
		>
		<div className="flex flex-col items-center text-center space-y-2 sm:aspect-square justify-center min-h-[100px]">
			<div className={`${colorClasses[color]} p-3 rounded-xl flex-shrink-0`}>
				<Icon className="w-8 h-8" />
			</div>
			<h3 className="text-xs sm:text-sm font-semibold break-words hyphens-auto leading-tight px-1 w-full">{title}</h3>
		</div>
		</Card>
	);
}

