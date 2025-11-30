import Header from "@/components/header";
import Footer from "@/components/footer";
import Loader from "@/components/loader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import {
	HeadContent,
	Outlet,
	createRootRouteWithContext,
	useRouterState,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../index.css";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Lalli Fafa - Interactive Storytelling for Kids",
			},
			{
				name: "description",
				content: "A magical story-telling platform for children 3+ with interactive adventures",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});
	const location = useLocation();
	
	// Show footer on all pages except landing page
	const showFooter = location.pathname !== "/";
	
	// Don't show header on admin routes
	const isAdminRoute = location.pathname.startsWith("/admin");

	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				<div className="min-h-screen flex flex-col">
					{!isAdminRoute && <Header />}
					<div className="flex-1">
						{isFetching ? <Loader /> : <Outlet />}
					</div>
					{showFooter && <Footer />}
				</div>
				<Toaster richColors />
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
