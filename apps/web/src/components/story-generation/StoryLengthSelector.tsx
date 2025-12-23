import { Zap, Book, Star, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";

interface StoryLengthOption {
	value: "short" | "medium" | "long";
	label: string;
	time: string;
	icon: typeof Zap;
	isLocked?: boolean;
}

interface StoryLengthSelectorProps {
	selectedLength: "short" | "medium" | "long";
	onLengthChange: (length: "short" | "medium" | "long") => void;
}

const lengthOptions: StoryLengthOption[] = [
	{ value: "short", label: "Quick Sparkle", time: "~2 min read", icon: Zap },
	{ value: "medium", label: "Adventure Time", time: "~3 min read", icon: Star },
	{ value: "long", label: "Epic Journey", time: "~5 min read", icon: Book, isLocked: true },
];

export default function StoryLengthSelector({
	selectedLength,
	onLengthChange,
}: StoryLengthSelectorProps) {
	const { isAuthenticated } = useConvexAuth();
	const subscription = useQuery(api.subscription.getSubscription, isAuthenticated ? {} : "skip");
	
	// Check if user has active subscription with future expiry date
	const hasActiveSubscription = subscription?.status === "active" && 
		subscription?.expiresAt && 
		subscription.expiresAt * 1000 > Date.now();
	console.log(hasActiveSubscription);
	return (
		<div className="space-y-3">
			<Label className="text-lg font-semibold text-foreground/80">
				Story Length:
			</Label>
			{lengthOptions.map((option) => {
				const Icon = option.icon;
				// If user has active subscription, unlock premium features
				const isLocked = hasActiveSubscription ? false : (option.isLocked || false);
				return (
					<label
						key={option.value}
						className={cn(
							"flex items-center gap-3 p-3 rounded-xl transition-all relative border",
							isLocked
								? "border-border bg-muted/50 cursor-not-allowed opacity-60"
								: selectedLength === option.value
								? "border-primary bg-primary/5 cursor-pointer"
								: "border-border hover:border-primary/50 bg-background cursor-pointer"
						)}
					>
						<input
							type="radio"
							name="storyLength"
							value={option.value}
							checked={selectedLength === option.value}
							onChange={(e) => !isLocked && onLengthChange(e.target.value as "short" | "medium" | "long")}
							disabled={isLocked}
							className="w-5 h-5 text-primary border-2 border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
						/>
						<Icon
							className={cn(
								"w-5 h-5",
								isLocked
									? "text-muted-foreground"
									: selectedLength === option.value
									? "text-primary"
									: "text-muted-foreground"
							)}
						/>
						<div className="flex-1">
							<div className="font-medium flex items-center gap-2">
								{option.label}
								{isLocked && (
									<Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 text-xs px-2 py-0.5">
										<Lock className="w-3 h-3 mr-1" />
										Premium
									</Badge>
								)}
							</div>
							<div className="text-sm text-muted-foreground">{option.time}</div>
						</div>
					</label>
				);
			})}
		</div>
	);
}
