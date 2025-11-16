import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";

export default function AdminUserMenu() {
	const navigate = useNavigate();
	const { isAuthenticated } = useConvexAuth();
	const user = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");

	const initials =
		(user?.name as string | undefined)
			?.split(" ")
			.map((s) => s[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() ||
		(user?.email as string | undefined)?.slice(0, 1).toUpperCase() ||
		"A";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-9 w-9 rounded-full p-0">
					<div className="h-9 w-9 rounded-full bg-slate-700 dark:bg-slate-600 text-white flex items-center justify-center text-xs font-medium">
						{initials}
					</div>
					<span className="sr-only">Open admin menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card" align="end">
				<DropdownMenuLabel>
					<div className="flex flex-col">
						<span className="text-sm font-medium">{user?.name ?? "Admin"}</span>
						{user?.email ? (
							<span className="text-xs text-muted-foreground">{user.email}</span>
						) : null}
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => {
						authClient.signOut({
							fetchOptions: {
								onSuccess: () => {
									navigate({ to: "/admin" });
								},
							},
						});
					}}
				>
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

