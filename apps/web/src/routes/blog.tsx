import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { BlogSection } from "@/components/landing/BlogSection";

export const Route = createFileRoute("/blog")({
	component: BlogComponent,
});

function BlogComponent() {
	const matchRoute = useMatchRoute();
	const isBlogSlugRoute = matchRoute({ to: "/blog/$slug" });

	return (
		<div className="min-h-screen bg-background">
			{isBlogSlugRoute ? <Outlet /> : <BlogSection />}
		</div>
	);
}
