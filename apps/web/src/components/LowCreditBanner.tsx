import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface LowCreditBannerProps {
	availableCredits: number;
}

export default function LowCreditBanner({ availableCredits }: LowCreditBannerProps) {
	const navigate = useNavigate();

	if (availableCredits > 10) {
		return null;
	}

	return (
		<Card className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-4">
			<div className="flex items-center justify-between gap-4 flex-wrap">
				<div className="flex items-center gap-3 flex-1 min-w-0">
					<AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
							Low Credits Warning
						</h3>
						<p className="text-sm text-orange-800 dark:text-orange-200">
							You're running low on credits! You have {availableCredits} credits remaining.
							Subscribe to a plan to get more credits and unlock premium features.
						</p>
					</div>
				</div>
				<Button
					onClick={() => navigate({ to: "/pricing", search: { plan: undefined } })}
					className="bg-orange-600 hover:bg-orange-700 text-white flex-shrink-0"
				>
					<Sparkles className="w-4 h-4 mr-2" />
					View Plans
				</Button>
			</div>
		</Card>
	);
}
