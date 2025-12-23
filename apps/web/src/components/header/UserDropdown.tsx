import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { User, LogOut } from "lucide-react";

interface UserDropdownProps {
	userName: string;
	userEmail?: string;
	userLevel?: number;
	isMobile?: boolean;
	onNavClick?: () => void;
}

export function UserDropdown({ 
	userName, 
	userEmail,
	userLevel = 1,
	isMobile = false,
	onNavClick 
}: UserDropdownProps) {
	const navigate = useNavigate();

	const handleProfileClick = () => {
		onNavClick?.();
		navigate({ to: "/profile" });
	};

	const handleLogout = () => {
		onNavClick?.();
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: "/" });
				},
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-border bg-white hover:bg-gray-50 transition-colors">
					<div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white shadow-inner">
						<User className="w-5 h-5" />
					</div>
					<div className="flex flex-col items-start">
						<span className="text-sm font-bold text-foreground leading-none">{userName}</span>
						<span className="text-xs text-muted-foreground">Level {userLevel} Explorer</span>
					</div>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card" align="end">
				<DropdownMenuLabel>
					<div className="flex flex-col">
						<span className="text-sm font-medium">{userName}</span>
						{userEmail ? (
							<span className="text-xs text-muted-foreground">{userEmail}</span>
						) : null}
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleProfileClick}>
					<User className="w-4 h-4 mr-2" />
					Profile
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleLogout}>
					<LogOut className="w-4 h-4 mr-2" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
