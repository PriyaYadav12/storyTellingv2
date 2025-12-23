import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { DesktopNavigation } from "./header/DesktopNavigation";
import { MobileNavigation } from "./header/MobileNavigation";
import { getLandingNavItems, getAppNavItems } from "./header/navigationConfig";

interface HeaderProps {
	onGetStarted?: () => void;
}

export default function Header({ onGetStarted }: HeaderProps) {
	const { isAuthenticated } = useConvexAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	
	const user = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");
	const profile = useQuery(api.userProfiles.getProfile, isAuthenticated ? {} : "skip");
	const credits = useQuery(api.credit.list, isAuthenticated ? {} : "skip");
	const stories = useQuery(api.stories.list, isAuthenticated ? {} : "skip");
	
	const userName = profile?.parentName || (user?.name as string | undefined) || "Friend";
	const availableCredits = credits?.[0]?.availableCredits || 0;
	const storyCount = stories?.length || 0;
	// Calculate level based on stories created (simple: every 5 stories = 1 level, minimum level 1)
	const userLevel = Math.max(1, Math.floor(storyCount / 5) + 1);
	const currentPath = location.pathname;

	const handleNavClick = () => {
		if (isMobileMenuOpen) setIsMobileMenuOpen(false);
	};

	const handleGetStarted = () => {
		if (isMobileMenuOpen) setIsMobileMenuOpen(false);
		if (onGetStarted) {
			onGetStarted();
		} else {
			navigate({ to: "/dashboard" });
		}
	};

	const landingNavItems = getLandingNavItems(navigate, currentPath);
	const appNavItems = getAppNavItems(currentPath);

	return (
		<header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-20">
					{/* Logo */}
					<Link 
						to={isAuthenticated ? "/dashboard" : "/"} 
						className="flex items-center gap-3 group"
					>
						<div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary bg-primary/10 transition-transform group-hover:scale-110">
							<img
								src="/logoNoBg.png"
								alt="LalliFafa"
								className="w-full h-full object-cover"
							/>
						</div>
						<span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
							LalliFafa
						</span>
					</Link>

					{/* Navigation */}
					<div className="flex items-center gap-4">
						<DesktopNavigation
							isAuthenticated={isAuthenticated}
							currentPath={currentPath}
							availableCredits={availableCredits}
							userName={userName}
							userEmail={user?.email}
							userLevel={userLevel}
							landingNavItems={landingNavItems}
							appNavItems={appNavItems}
							onGetStarted={handleGetStarted}
						/>

						{/* Mobile Menu Toggle */}
						<Button
							variant="ghost"
							size="sm"
							className="md:hidden"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
						</Button>
					</div>
				</div>
			</div>

			{/* Mobile Dropdown */}
			{isMobileMenuOpen && (
				<MobileNavigation
					isAuthenticated={isAuthenticated}
					availableCredits={availableCredits}
					userName={userName}
					userEmail={user?.email}
					userLevel={userLevel}
					landingNavItems={landingNavItems}
					appNavItems={appNavItems}
					onGetStarted={handleGetStarted}
					onNavClick={handleNavClick}
				/>
			)}
		</header>
	);
}
