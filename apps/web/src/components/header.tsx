import { Link } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const { isAuthenticated } = useConvexAuth();

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<Link to="/" className="flex items-center">
					<img
						src="/logo.jpg"
						alt="Lalli Fafa logo"
						className="h-10 w-auto"
					/>
				</Link>
				<div className="flex items-center gap-2">
					<ModeToggle />
					{isAuthenticated && <UserMenu />}
				</div>
			</div>
			<hr />
		</div>
	);
}
