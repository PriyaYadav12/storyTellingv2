import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CreditCard, HelpCircle, Star } from "lucide-react";
import { NavButton } from "./NavButton";
import { UserDropdown } from "./UserDropdown";
import { type LandingNavItem, type AppNavItem } from "./navigationConfig";

interface DesktopNavigationProps {
	isAuthenticated: boolean;
	currentPath: string;
	availableCredits: number;
	userName: string;
	userEmail?: string;
	landingNavItems: LandingNavItem[];
	appNavItems: AppNavItem[];
	onGetStarted: () => void;
}

export function DesktopNavigation({
	isAuthenticated,
	currentPath,
	availableCredits,
	userName,
	userEmail,
	landingNavItems,
	appNavItems,
	onGetStarted,
}: DesktopNavigationProps) {
	return (
		<div className="hidden sm:flex gap-2">
			{isAuthenticated ? (
				// Authenticated: App navigation
				<>
					{appNavItems.map((item) => (
						<Link key={item.label} to={item.path as any}>
							<Button
								variant="ghost"
								className={`text-base font-semibold rounded-full px-6 ${
									item.isActive
										? "bg-primary/10 text-primary"
										: "hover:bg-primary/10"
								}`}
							>
								{item.label}
							</Button>
						</Link>
					))}
					
					<Button
						variant="ghost"
						className="gap-2 text-base font-semibold rounded-full px-6"
						disabled
					>
						<CreditCard className="w-5 h-5" />
						<span className="hidden md:inline">{availableCredits} Credits</span>
					</Button>
					
					<UserDropdown 
						userName={userName} 
						userEmail={userEmail}
						isMobile={false}
					/>
				</>
			) : (
				// Unauthenticated: Landing page navigation
				<>
					{landingNavItems.map((item) => (
						<NavButton
							key={item.label}
							label={item.label}
							icon={item.icon}
							style={item.style}
							onClick={item.action}
						/>
					))}

					<Link to="/faq">
						<Button
							variant="ghost"
							size="default"
							className="rounded-[25px] hover:scale-105 transition-all duration-300"
							style={{ backgroundColor: "#6366F1", color: "#fff" }}
						>
							<HelpCircle className="w-4 h-4 mr-2" />
							FAQ
						</Button>
					</Link>

					<Button
						onClick={onGetStarted}
						size="sm"
						className="rounded-[30px] shadow-lg shadow-primary/30 hover:scale-105 transition-all duration-300"
						style={{ backgroundColor: "#CB0404", color: "#fff" }}
					>
						<Star className="w-3 md:w-4 h-3 md:h-4 mr-2 fill-current" />
						Log In / Sign Up
					</Button>
				</>
			)}
		</div>
	);
}
