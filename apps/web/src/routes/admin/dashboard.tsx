import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
	Settings, 
	FileText, 
	BookOpen, 
	Users, 
	FolderOpen,
	LayoutDashboard 
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<AuthLoading>{null}</AuthLoading>
			<Authenticated>
				<DashboardContent />
			</Authenticated>
			<Unauthenticated>
				<Navigate to="/admin" replace />
			</Unauthenticated>
		</>
	);
}

function DashboardContent() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-7xl px-4 py-8">
				{/* Dashboard Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
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
						<TabsTrigger value="blog" className="flex items-center gap-2">
							<FileText className="h-4 w-4" />
							<span className="hidden sm:inline">Blog</span>
						</TabsTrigger>
						<TabsTrigger value="assets" className="flex items-center gap-2">
							<FolderOpen className="h-4 w-4" />
							<span className="hidden sm:inline">Assets</span>
						</TabsTrigger>
						<TabsTrigger value="settings" className="flex items-center gap-2">
							<Settings className="h-4 w-4" />
							<span className="hidden sm:inline">Settings</span>
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
								<div className="space-y-4">
									<p className="text-muted-foreground">
										Stories management interface coming soon...
									</p>
									{/* Add stories table/list here */}
								</div>
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
								<div className="space-y-4">
									<p className="text-muted-foreground">
										Users management interface coming soon...
									</p>
									{/* Add users table/list here */}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="blog">
						<Card>
							<CardHeader>
								<CardTitle>Blog Management</CardTitle>
								<CardDescription>
									Create and manage blog posts
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<p className="text-muted-foreground">
										Blog management interface coming soon...
									</p>
									{/* Add blog editor here */}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="assets">
						<Card>
							<CardHeader>
								<CardTitle>Assets Management</CardTitle>
								<CardDescription>
									Manage images, videos, and other media files
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<p className="text-muted-foreground">
										Assets management interface coming soon...
									</p>
									{/* Add asset manager here */}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="settings">
						<Card>
							<CardHeader>
								<CardTitle>Application Settings</CardTitle>
								<CardDescription>
									Configure application settings and preferences
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<p className="text-muted-foreground">
										Settings interface coming soon...
									</p>
									{/* Add settings form here */}
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

