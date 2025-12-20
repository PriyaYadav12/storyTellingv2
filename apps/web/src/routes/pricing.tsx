import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useConvexAuth,
} from "convex/react";
import { PricingSection } from "@/components/landing/PricingSection";
import { useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			plan: (search.plan as string) || undefined,
		};
	},
});

function RouteComponent() {
	const { isAuthenticated } = useConvexAuth();
	const navigate = useNavigate();
	const search = Route.useSearch();
	const initiateSubscription = useAction(api.subscription.initiateSubscription);

	useEffect(() => {
		// If user is authenticated and has a pending plan, create subscription
		if (isAuthenticated && search.plan) {
			const handleSubscription = async () => {
				try {
					const planIdMap: Record<string, string> = {
						monthly: "plan_RpZZiFsx7YI1rA",
						yearly: "plan_RpZabHcv8xiaoZ",
					};

					const razorpayPlanId = planIdMap[search?.plan as string];
					if (!razorpayPlanId) {
						toast.error("Invalid plan selected");
						navigate({ to: "/dashboard" });
						return;
					}

					const { checkoutUrl } = await initiateSubscription({
						planId: razorpayPlanId,
					});

					if (checkoutUrl) {
						window.location.href = checkoutUrl;
					} else {
						toast.error("Failed to create subscription");
						navigate({ to: "/dashboard" });
					}
				} catch (error) {
					console.error("Error initiating subscription:", error);
					toast.error(
						error instanceof Error
							? error.message
							: "Failed to initiate subscription"
					);
					navigate({ to: "/dashboard" });
				}
			};

			handleSubscription();
		}
	}, [isAuthenticated, search.plan, initiateSubscription, navigate]);

	return (
		<>
			<AuthLoading>{null}</AuthLoading>
			<Authenticated>
				<div className="min-h-screen bg-background">
					<PricingSection />
				</div>
			</Authenticated>
			<Unauthenticated>
				<Navigate to="/dashboard" replace />
			</Unauthenticated>
		</>
	);
}
