import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CreditCard, HelpCircle, Star } from "lucide-react";
import { NavButton } from "./NavButton";
import { UserDropdown } from "./UserDropdown";
import { type LandingNavItem, type AppNavItem } from "./navigationConfig";

interface MobileNavigationProps {
	isAuthenticated: boolean;
	availableCredits: number;
	userName: string;
	userEmail?: string;
	userLevel?: number;
	landingNavItems: LandingNavItem[];
	appNavItems: AppNavItem[];
	onGetStarted: () => void;
	onNavClick: () => void;
}

export function MobileNavigation({
	isAuthenticated,
	availableCredits,
	userName,
	userEmail,
	userLevel = 1,
	landingNavItems,
	appNavItems,
	onGetStarted,
	onNavClick,
}: MobileNavigationProps) {
	return (
		<div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-xl">
			<div className="container mx-auto px-4 py-4 flex flex-col gap-3">
				{isAuthenticated ? (
					// Authenticated: App navigation mobile
					<>
						{appNavItems.map((item) => (
							<Link
								key={item.label}
								to={item.path as any}
								onClick={onNavClick}
							>
								<Button
									variant="ghost"
									className={`w-full justify-center rounded-full ${
										item.isActive ? "bg-primary/10 text-primary" : ""
									}`}
								>
									{item.label}
								</Button>
							</Link>
						))}
						
						<Button
							variant="ghost"
							className="w-full justify-center gap-2 rounded-full"
							disabled
						>
							<CreditCard className="w-5 h-5" />
							{availableCredits} Credits
						</Button>
						
						<UserDropdown 
							userName={userName} 
							userEmail={userEmail}
							userLevel={userLevel}
							isMobile={true}
							onNavClick={onNavClick}
						/>
					</>
				) : (
					// Unauthenticated: Landing navigation mobile
					<>
					{landingNavItems.map((item) => (
						<NavButton
							key={item.label}
							label={item.label}
							icon={item.icon}
							style={item.style}
							className="w-full justify-center"
							onClick={() => {
								onNavClick();
								item.action();
							}}
						/>
					))}

						<Link
							to="/faq"
							onClick={onNavClick}
						>
							<Button
								variant="ghost"
								className="w-full justify-center gap-2 rounded-[25px]"
								style={{ backgroundColor: "#6366F1", color: "#fff" }}
							>
								<HelpCircle className="w-4 h-4" />
								FAQ
							</Button>
						</Link>

						<NavButton
							label="Log In / Sign Up"
							icon={<Star className="w-4 h-4 mr-2 fill-current" />}
							style={{ backgroundColor: "#CB0404", color: "#fff" }}
							className="rounded-[30px] w-full justify-center shadow-lg shadow-primary/30"
							onClick={() => {
								onNavClick();
								onGetStarted();
							}}
						/>
					</>
				)}
			</div>
		</div>
	);
}
