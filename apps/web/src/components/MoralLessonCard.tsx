import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface MoralLessonCardProps {
	icon: LucideIcon;
	title: string;
	isSelected?: boolean;
	onClick?: () => void;
}

export default function MoralLessonCard({ 
	icon: Icon, 
	title, 
	isSelected = false, 
	onClick 
}: MoralLessonCardProps) {
	return (
		<Badge
			variant={isSelected ? "default" : "secondary"}
			className={`
				px-6 py-3 text-base rounded-2xl cursor-pointer 
				hover:shadow-lg active:scale-95 transition-all
				${isSelected ? "scale-105" : ""}
			`}
			onClick={onClick}
			data-testid={`badge-lesson-${title.toLowerCase().replace(/\s+/g, '-')}`}
		>
			<Icon className="w-5 h-5 mr-2" />
			{title}
		</Badge>
	);
}

