import { Link } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { ModeToggle } from "../mode-toggle";
import AdminUserMenu from "./admin-user-menu";
import { Shield } from "lucide-react";

export default function AdminHeader() {
	const { isAuthenticated } = useConvexAuth();

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-4 py-3 border-b">
				<Link to="/admin/dashboard" className="flex items-center gap-2">
					<div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center">
						<Shield className="h-5 w-5 text-white" />
					</div>
					<span className="font-semibold text-lg">Admin Panel</span>
				</Link>
				<div className="flex items-center gap-2">
					{isAuthenticated && <AdminUserMenu />}
				</div>
			</div>
		</div>
	);
}

