import { UserCircle, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Child {
	id: "1" | "2";
	name: string;
}

interface ChildSelectorProps {
	children: Child[];
	selectedChild: "1" | "2";
	hasMultipleChildren: boolean;
	onChildChange: (childId: "1" | "2") => void;
	onAddChild: () => void;
}

export default function ChildSelector({
	children,
	selectedChild,
	hasMultipleChildren,
	onChildChange,
	onAddChild,
}: ChildSelectorProps) {
	if (children.length === 0) return null;

	return (
		<div className="space-y-3">
			<Label className="text-lg font-semibold flex items-center gap-2">
				<UserCircle className="w-5 h-5" />
				Select Adventurer
			</Label>
			<div className="inline-flex rounded-xl bg-muted p-1 border border-border">
				{children.map((child) => (
					<button
						key={child.id}
						type="button"
						onClick={() => onChildChange(child.id)}
						className={cn(
							"px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
							selectedChild === child.id
								? "bg-primary text-primary-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						{child.name}
					</button>
				))}
				{!hasMultipleChildren && (
					<button
						type="button"
						onClick={onAddChild}
						className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground flex items-center gap-2"
					>
						<Plus className="w-4 h-4" />
						Add Child
					</button>
				)}
			</div>
		</div>
	);
}
