import { Button } from "@/components/ui/button";

interface NavButtonProps {
	label: string;
	icon?: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
	onClick?: () => void;
}

export function NavButton({
	label,
	icon,
	style,
	className = "",
	onClick,
}: NavButtonProps) {
	return (
		<Button
			variant="ghost"
			size="default"
			onClick={onClick}
			style={style}
			className={`rounded-[25px] hover:scale-105 transition-all duration-300 ${className}`}
		>
			{icon}
			{label}
		</Button>
	);
}
