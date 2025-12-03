import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
	Settings, 
	BookOpen, 
	Users, 
	FolderOpen,
	LayoutDashboard,
	Shield,
	ScrollText,
} from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import { AdminStories } from "@/components/stories/adminStories";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAssets } from "@/components/admin/AdminAssets";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminBlog } from "@/components/admin/AdminBlog";
export const Route = createFileRoute("/admin/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const getUserRole = useQuery(api.auth.getUserRole);
	console.log("getUserRole:", getUserRole);

	return (
		<>
			<AuthLoading>{null}</AuthLoading>
			<Authenticated>
				{getUserRole === undefined ? (
					// Loading state
					<div className="flex items-center justify-center min-h-screen">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : getUserRole === "admin" ? (
					// Admin user, show dashboard
					<DashboardContent />
				) : (
					// Not an admin, redirect to home
					<>
						<Navigate to="/" replace />
						<div className="flex items-center justify-center min-h-screen">
							<div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
								<Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
								<h2 className="text-xl font-bold text-red-700 dark:text-red-400">
									Access Denied
								</h2>
								<p className="text-red-600 dark:text-red-300 mt-2">
									You don't have permission to access the admin panel.
								</p>
							</div>
						</div>
					</>
				)}
			</Authenticated>
			<Unauthenticated>
				<Navigate to="/admin" replace />
			</Unauthenticated>
		</>
	);
}

function DashboardContent() {
	const navigate = useNavigate();

	const handlePlayStory = (id: string) => {
		navigate({ to: "/story/$storyId", params: { storyId: id } });
	};

	return (
		<div className="min-h-screen bg-background">
			<AdminHeader />
			<div className="container mx-auto max-w-5xl px-4 py-8">
				{/* Dashboard Header */}
				<div className="mb-8">
					<div className="flex items-center gap-2 mb-2">
						<LayoutDashboard className="h-8 w-8 text-primary" />
						<h1 className="text-3xl font-bold">Admin Dashboard</h1>
					</div>
					<p className="text-muted-foreground">
						Manage your application content and settings
					</p>
				</div>

				{/* Tabs */}
				<Tabs defaultValue="stories" className="w-full">
					<TabsList className="grid w-full grid-cols-5 mb-8">
						<TabsTrigger value="stories" className="flex items-center gap-2">
							<BookOpen className="h-4 w-4" />
							<span className="hidden sm:inline">Stories</span>
						</TabsTrigger>
						<TabsTrigger value="users" className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							<span className="hidden sm:inline">Users</span>
						</TabsTrigger>
						<TabsTrigger value="assets" className="flex items-center gap-2">
							<FolderOpen className="h-4 w-4" />
							<span className="hidden sm:inline">Assets</span>
						</TabsTrigger>
						<TabsTrigger value="settings" className="flex items-center gap-2">
							<Settings className="h-4 w-4" />
							<span className="hidden sm:inline">Settings</span>
						</TabsTrigger>
						<TabsTrigger value="blog" className="flex items-center gap-2">
							<ScrollText className="h-4 w-4" />
							<span className="hidden sm:inline">Blog</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="stories">
						<Card>
							<CardHeader>
								<CardTitle>Stories Management</CardTitle>
								<CardDescription>
									View and manage all user-generated stories
								</CardDescription>
							</CardHeader>
							<CardContent>
								<AdminStories handlePlayStory={handlePlayStory} />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="users">
						<Card>
							<CardHeader>
								<CardTitle>Users Management</CardTitle>
								<CardDescription>
									View and manage user accounts
								</CardDescription>
							</CardHeader>
							<CardContent>
								<AdminUsers />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="blog">
						<Card>
							<CardHeader>
								<CardTitle>Blog Management</CardTitle>
								<CardDescription>
									View and manage all blog posts
								</CardDescription>
							</CardHeader>
							<CardContent>
								<AdminBlog />
							</CardContent>
						</Card>
					</TabsContent>

						<TabsContent value="assets">
							<Card>
								<CardHeader>
									<CardTitle>Assets Management</CardTitle>
									<CardDescription>
										Manage images, videos, and other media files from all stories
									</CardDescription>
								</CardHeader>
								<CardContent>
									<AdminAssets />
								</CardContent>
							</Card>
						</TabsContent>

					<TabsContent value="settings">
						<AdminSettings />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

