import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, HelpCircle, User, Star } from "lucide-react";
import { NavButton } from "./NavButton";
import { UserDropdown } from "./UserDropdown";
import { type LandingNavItem, type AppNavItem } from "./navigationConfig";
import { cn } from "@/lib/utils";

interface DesktopNavigationProps {
	isAuthenticated: boolean;
	currentPath: string;
	availableCredits: number;
	userName: string;
	userEmail?: string;
	userLevel?: number;
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
	userLevel = 1,
	landingNavItems,
	appNavItems,
	onGetStarted,
}: DesktopNavigationProps) {
	return (
		<div className="hidden md:flex items-center gap-4">
			{isAuthenticated ? (
				// Authenticated: App navigation with pill container
				<>
					<div className="flex items-center gap-2 bg-secondary/10 px-2 py-1.5 rounded-full">
						{appNavItems.map((item) => {
							// Map label to icon
							const IconComponent = 
								item.label === "Home" ? Home :
								item.label === "Library" ? BookOpen :
								HelpCircle;
							
							return (
								<Link key={item.label} to={item.path as any}>
									<button
										className={cn(
											"px-6 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2",
											item.isActive 
												? "bg-white text-primary shadow-sm" 
												: "text-muted-foreground hover:text-primary hover:bg-white/50"
										)}
									>
										<IconComponent className="w-4 h-4" />
										{item.label}
									</button>
								</Link>
							);
						})}
					</div>
					
					{/* Credits & User Profile */}
					<div className="flex items-center gap-4">
						<div className="hidden sm:flex flex-col items-end mr-2">
							<span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Credits</span>
							<span className="text-lg font-bold text-accent-foreground">{availableCredits} ✨</span>
						</div>
						
						<UserDropdown 
							userName={userName} 
							userEmail={userEmail}
							userLevel={userLevel}
							isMobile={false}
						/>
					</div>
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
