import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Star, Crown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useAction } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface PricingPlan {
	id: string;
	name: string;
	price: string;
	period: string;
	badge?: string;
	badgeColor?: string;
	features: {
		icon?: string;
		text: string;
		highlight?: boolean;
	}[];
	buttonText: string;
	buttonVariant?: "default" | "outline" | "ghost";
	isSelected?: boolean;
	isPopular?: boolean;
}

const pricingPlans: PricingPlan[] = [
	{
		id: "free",
		name: "FREE PLAN",
		price: "₹0",
		period: "Forever free",
		features: [
			{ icon: "🎁", text: "250 welcome credits" },
			{ icon: "📝", text: "Text-only stories" },
			{ icon: "📘", text: "2-min (60credit) and 3-min (80credit) stories" },
			{ icon: "🔒", text: "5-min stories locked" },
			{ icon: "🚫", text: "No bonus credits" },
		],
		buttonText: "already selected",
		buttonVariant: "outline",
		isSelected: true,
	},
	{
		id: "monthly",
		name: "MAGIC PASS — MONTHLY",
		price: "₹199",
		period: "/ month",
		badge: "Most Popular",
		badgeColor: "from-orange-500 to-pink-500",
		isPopular: true,
		features: [
			{ icon: "🎁", text: "1000 credits instantly" },
			{ icon: "🕒", text: "Unlock 5-min stories" },
			{ icon: "⚡", text: "Priority generation" },
			{ icon: "🔁", text: "Unlimited retries" },
			{ icon: "📆", text: "Cancel anytime" },
		],
		buttonText: "Start Magic Pass – ₹199",
	},
	{
		id: "yearly",
		name: "MAGIC PASS — YEARLY",
		price: "₹1999",
		period: "/ year",
		badge: "Best Value (Save 20%)",
		badgeColor: "from-purple-500 to-pink-500",
		features: [
			{ icon: "🎁", text: "2,000 credits instantly; plus 100 credit per day" },
			{ icon: "🕒", text: "All story durations unlocked" },
			{ icon: "🌟", text: "Early access to new features" },
			{ icon: "💎", text: "Highest credit value per rupee" },
		],
		buttonText: "Go Yearly – ₹1999",
	},
];

function PricingCard({ plan }: { plan: PricingPlan }) {
	const navigate = useNavigate();
	const { isAuthenticated } = useConvexAuth();
	const initiateSubscription = useAction(api.subscription.initiateSubscription);
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = async () => {
		if (plan.isSelected || plan.id === "free") {
			return;
		}

		try {
			setIsLoading(true);

			if (!isAuthenticated) {
				// Store plan ID in localStorage and redirect to signin
				localStorage.setItem("pendingPlanId", plan.id);
				navigate({ to: "/dashboard" });
				return;
			}

			// User is authenticated, create subscription and redirect to checkout
			const planIdMap: Record<string, string> = {
				monthly: "plan_RpZZiFsx7YI1rA",
				yearly: "plan_RpZabHcv8xiaoZ",
			};

			const razorpayPlanId = planIdMap[plan.id];
			if (!razorpayPlanId) {
				toast.error("Invalid plan selected");
				return;
			}

			const { checkoutUrl } = await initiateSubscription({
				planId: razorpayPlanId,
			});

			if (checkoutUrl) {
				window.location.href = checkoutUrl;
			} else {
				toast.error("Failed to create subscription");
			}
		} catch (error) {
			console.error("Error initiating subscription:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to initiate subscription"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card
			className={`group relative overflow-hidden bg-card/80 backdrop-blur-sm border-2 rounded-[20px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
				plan.isPopular
					? "border-primary/50 shadow-lg scale-105 md:scale-110"
					: plan.isSelected
					? "border-primary/30"
					: "hover:border-primary/50"
			}`}
		>
			{/* Badge */}
			{plan.badge && (
				<div className="absolute top-4 right-4 z-10">
					<div
						className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${plan.badgeColor} shadow-lg`}
					>
						{plan.badge}
					</div>
				</div>
			)}

			{/* Selected indicator */}
			{plan.isSelected && (
				<div className="absolute top-4 left-4 z-10">
					<div className="px-3 py-1 rounded-full text-xs font-bold text-primary bg-primary/10 border border-primary/30">
						✓ Selected
					</div>
				</div>
			)}

			<div className="p-6 md:p-8">
				{/* Header */}
				<div className="mb-6">
					<h3 className="text-xl md:text-2xl font-black text-foreground mb-2">
						{plan.name}
					</h3>
					<div className="flex items-baseline gap-2 mb-1">
						<span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
							{plan.price}
						</span>
						<span className="text-base md:text-lg text-muted-foreground font-medium">
							{plan.period}
						</span>
					</div>
				</div>

				{/* Features */}
				<ul className="space-y-3 mb-6">
					{plan.features.map((feature, index) => (
						<li key={index} className="flex items-start gap-3">
							<span className="text-lg flex-shrink-0">{feature.icon}</span>
							<span className="text-sm md:text-base text-muted-foreground leading-relaxed">
								{feature.text}
							</span>
						</li>
					))}
				</ul>

				{/* CTA Button */}
				<Button
					variant={plan.buttonVariant || "default"}
					disabled={plan.isSelected || isLoading}
					onClick={handleClick}
					className={`w-full rounded-[25px] font-semibold transition-all duration-300 ${
						plan.isSelected
							? "cursor-default"
							: "hover:scale-105 hover:shadow-lg"
					} ${
						plan.isPopular
							? "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
							: plan.buttonVariant === "outline"
							? ""
							: "bg-primary text-white"
					}`}
				>
					{isLoading ? "Processing..." : plan.buttonText}
				</Button>
			</div>
		</Card>
	);
}

export function PricingSection() {
	return (
		<section id="pricing-section" className="py-8 md:py-16 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
			{/* Decorative background elements */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-chart-2/5 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
			</div>

			{/* Floating decorative icons */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="hidden md:block absolute top-20 left-10">
					<Sparkles className="w-10 h-10 text-yellow-400 opacity-20 animate-pulse" />
				</div>
				<div className="hidden md:block absolute top-40 right-20">
					<Star className="w-12 h-12 text-blue-400 opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
				</div>
				<div className="hidden md:block absolute bottom-20 left-1/4">
					<Crown className="w-10 h-10 text-pink-400 opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
				</div>
			</div>

			<div className="container mx-auto px-4 md:px-6 relative z-10">
				{/* Header */}
				<div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4">
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm md:text-base font-bold text-primary mb-2 md:mb-4">
						<Star className="w-4 h-4 md:w-5 md:h-5" />
						<span>Pricing Plans</span>
					</div>
					<h1 className="text-4xl md:text-6xl lg:text-7xl font-black">
						<span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
							Choose Your
						</span>
						<br />
						<span className="text-foreground">Magic Pass</span>
					</h1>
					<p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
						Start free or unlock unlimited storytelling adventures with our Magic Pass plans
					</p>
				</div>

				{/* Pricing Cards */}
				<div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
					{pricingPlans.map((plan) => (
						<PricingCard key={plan.id} plan={plan} />
					))}
				</div>
			</div>
		</section>
	);
}
