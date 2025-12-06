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
import { UserCircle, LogOut } from "lucide-react";

interface UserDropdownProps {
	userName: string;
	userEmail?: string;
	isMobile?: boolean;
	onNavClick?: () => void;
}

export function UserDropdown({ 
	userName, 
	userEmail, 
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
				<Button
					variant="ghost"
					className={`gap-2 text-base font-semibold rounded-full px-6 ${
						isMobile ? "w-full justify-center" : ""
					}`}
				>
					<UserCircle className="w-5 h-5" />
					<span className={isMobile ? "" : "hidden md:inline"}>{userName}</span>
				</Button>
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
					<UserCircle className="w-4 h-4 mr-2" />
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
