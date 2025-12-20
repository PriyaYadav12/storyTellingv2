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
	
	const userName = profile?.parentName || (user?.name as string | undefined) || "Friend";
	const availableCredits = credits?.[0]?.availableCredits || 0;
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
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
				{/* Logo */}
				<Link 
					to={isAuthenticated ? "/dashboard" : "/"} 
					className="flex items-center gap-2 md:gap-3 cursor-pointer hover-elevate rounded-lg p-2"
				>
					<img
						src="/logoNoBg.png"
						alt="LalliFafa"
						className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full"
					/>
					<h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
						LalliFafa
					</h1>
				</Link>

				{/* Navigation */}
				<div className="flex items-center gap-2 md:gap-3">
					<DesktopNavigation
						isAuthenticated={isAuthenticated}
						currentPath={currentPath}
						availableCredits={availableCredits}
						userName={userName}
						userEmail={user?.email}
						landingNavItems={landingNavItems}
						appNavItems={appNavItems}
						onGetStarted={handleGetStarted}
					/>

					{/* Mobile Menu Toggle */}
					<Button
						variant="ghost"
						size="sm"
						className="sm:hidden"
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					>
						{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
					</Button>
				</div>
			</div>

			{/* Mobile Dropdown */}
			{isMobileMenuOpen && (
				<MobileNavigation
					isAuthenticated={isAuthenticated}
					availableCredits={availableCredits}
					userName={userName}
					userEmail={user?.email}
					landingNavItems={landingNavItems}
					appNavItems={appNavItems}
					onGetStarted={handleGetStarted}
					onNavClick={handleNavClick}
				/>
			)}
		</header>
	);
}
