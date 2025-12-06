import { BookOpen, ShoppingBag, CreditCard } from "lucide-react";

export interface LandingNavItem {
	label: string;
	icon: React.ReactNode;
	style: React.CSSProperties;
	action: () => void;
}

export interface AppNavItem {
	label: string;
	path: string;
	isActive: boolean;
}

export function getLandingNavItems(navigate: (options: { to: string }) => void): LandingNavItem[] {
	return [
		{
			label: "Shop",
			icon: <ShoppingBag className="w-4 h-4 mr-2" />,
			style: { backgroundColor: "#FF9F00", color: "#fff" },
			action: () => {
				const shopSection = document.getElementById("shop");
				if (shopSection) {
					shopSection.scrollIntoView({ behavior: "smooth" });
				}
			},
		},
		{
			label: "Blog",
			icon: <BookOpen className="w-4 h-4 mr-2" />,
			style: { backgroundColor: "#F4631E", color: "#fff" },
			action: () => {
				navigate({ to: "/blog" });
			},
		},
		{
			label: "Pricing",
			icon: <CreditCard className="w-4 h-4 mr-2" />,
			style: { backgroundColor: "#F875AA", color: "#fff" },
			action: () => {
				const pricingSection = document.getElementById("pricing-section");
				if (pricingSection) {
					pricingSection.scrollIntoView({ behavior: "smooth" });
				}
			},
		},
	];
}

export function getAppNavItems(currentPath: string): AppNavItem[] {
	return [
		{
			label: "Home",
			path: "/dashboard",
			isActive: currentPath === "/dashboard",
		},
		{
			label: "Library",
			path: "/library",
			isActive: currentPath === "/library",
		},
		{
			label: "FAQ",
			path: "/faq",
			isActive: currentPath === "/faq",
		}
	];
}
