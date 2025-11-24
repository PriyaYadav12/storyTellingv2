import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingBag, Star, Menu, X, UserCircle } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
	onGetStarted?: () => void;
}

// Landing page nav items (for unauthenticated users)
const landingNavItems = [
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
			// TODO: Add blog link or scroll to blog section
			console.log("Blog clicked");
		},
	},
];

function NavButton({
	label,
	icon,
	style,
	className = "",
	onClick,
}: {
	label: string;
	icon?: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
	onClick?: () => void;
}) {
	return (
		<Button
			variant="ghost"
			size="default"
			onClick={onClick}
			style={style}
			className={`rounded-[25px] hover:scale-105 transition-all duration-300 ${className}`}
		>
			{icon}
			{label}
		</Button>
	);
}

export default function Header({ onGetStarted }: HeaderProps) {
	const { isAuthenticated } = useConvexAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	
	const user = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");
	const profile = useQuery(api.userProfiles.getProfile, isAuthenticated ? {} : "skip");
	
	const userName = profile?.parentName || (user?.name as string | undefined) || "Friend";
	const currentPath = location.pathname;
	const isLandingPage = currentPath === "/";

	const handleNavClick = (action?: () => void) => {
		if (isMobileMenuOpen) setIsMobileMenuOpen(false);
		action?.();
	};

	const handleGetStarted = () => {
		if (isMobileMenuOpen) setIsMobileMenuOpen(false);
		if (onGetStarted) {
			onGetStarted();
		} else {
			navigate({ to: "/dashboard" });
		}
	};

	// App navigation items (for authenticated users)
	const appNavItems = [
		{
			label: "Home",
			path: "/dashboard",
			isActive: currentPath === "/dashboard",
		},
		{
			label: "Library",
			path: "/library",
			isActive: currentPath === "/library",
		}
	];

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
						className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-full"
					/>
					<h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
						LalliFafa
					</h1>
				</Link>

				{/* Navigation */}
				<div className="flex items-center gap-2 md:gap-3">
					{/* Desktop Navigation */}
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
								
								<Link to="/profile">
									<Button
										variant="ghost"
										className="gap-2 text-base font-semibold rounded-full px-6"
									>
										<UserCircle className="w-5 h-5" />
										<span className="hidden md:inline">{userName}</span>
									</Button>
								</Link>
								
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

								<Button
									onClick={handleGetStarted}
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
				<div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-xl">
					<div className="container mx-auto px-4 py-4 flex flex-col gap-3">
						{isAuthenticated ? (
							// Authenticated: App navigation mobile
							<>
								{appNavItems.map((item) => (
									<Link
										key={item.label}
										to={item.path as any}
										onClick={() => handleNavClick()}
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
								
								<Link
									to="/profile"
									onClick={() => handleNavClick()}
								>
									<Button
										variant="ghost"
										className="w-full justify-center gap-2 rounded-full"
									>
										<UserCircle className="w-5 h-5" />
										Profile
									</Button>
								</Link>
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
										onClick={() => handleNavClick(item.action)}
									/>
								))}

								<NavButton
									label="Log In / Sign Up"
									icon={<Star className="w-4 h-4 mr-2 fill-current" />}
									style={{ backgroundColor: "#CB0404", color: "#fff" }}
									className="rounded-[30px] w-full justify-center shadow-lg shadow-primary/30"
									onClick={() => handleNavClick(handleGetStarted)}
								/>
							</>
						)}
					</div>
				</div>
			)}
		</header>
	);
}
