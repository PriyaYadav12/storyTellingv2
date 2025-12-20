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

export function getLandingNavItems(
	navigate: (options: { to: string }) => void,
	currentPath: string
): LandingNavItem[] {
	const items: LandingNavItem[] = [];
	
	// Don't show Shop and Pricing on dashboard route
	const isDashboardRoute = currentPath === "/dashboard";
	
	// Shop button - only show if not on dashboard
	if (!isDashboardRoute) {
		items.push({
			label: "Shop",
			icon: <ShoppingBag className="w-4 h-4 mr-2" />,
			style: { backgroundColor: "#FF9F00", color: "#fff" },
			action: () => {
				if (currentPath === "/") {
					// On home page, scroll to section
					const shopSection = document.getElementById("shop");
					if (shopSection) {
						shopSection.scrollIntoView({ behavior: "smooth" });
					}
				} else {
					// Not on home page, navigate to home then scroll
					navigate({ to: "/" });
					// Scroll after navigation completes
					setTimeout(() => {
						const shopSection = document.getElementById("shop");
						if (shopSection) {
							shopSection.scrollIntoView({ behavior: "smooth" });
						}
					}, 300);
				}
			},
		});
	}
	
	// Blog button - always show
	items.push({
		label: "Blog",
		icon: <BookOpen className="w-4 h-4 mr-2" />,
		style: { backgroundColor: "#F4631E", color: "#fff" },
		action: () => {
			navigate({ to: "/blog" });
		},
	});
	
	// Pricing button - only show if not on dashboard
	if (!isDashboardRoute) {
		items.push({
			label: "Pricing",
			icon: <CreditCard className="w-4 h-4 mr-2" />,
			style: { backgroundColor: "#F875AA", color: "#fff" },
			action: () => {
				if (currentPath === "/") {
					// On home page, scroll to section
					const pricingSection = document.getElementById("pricing-section");
					if (pricingSection) {
						pricingSection.scrollIntoView({ behavior: "smooth" });
					}
				} else {
					// Not on home page, navigate to home then scroll
					navigate({ to: "/" });
					// Scroll after navigation completes
					setTimeout(() => {
						const pricingSection = document.getElementById("pricing-section");
						if (pricingSection) {
							pricingSection.scrollIntoView({ behavior: "smooth" });
						}
					}, 300);
				}
			},
		});
	}
	
	return items;
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
