import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Doc } from "@story-telling-v2/backend/convex/_generated/dataModel";

function BlogCard({ blog }: { blog: Doc<"blogs"> }) {
	const publishedDate = blog.publishedAt
		? new Date(blog.publishedAt).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
		  })
		: null;

	return (
		<Card className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border-2 hover:border-primary/50 rounded-[20px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
			<div className="p-5 md:p-6">
				<div className="flex items-start gap-4 mb-4">
					<div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
						<BookOpen className="w-6 h-6 md:w-7 md:h-7 text-white" />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-black text-lg md:text-xl text-foreground group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2">
							{blog.title}
						</h3>
						{publishedDate && (
							<div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
								<Calendar className="w-3 h-3 md:w-4 md:h-4" />
								<span>{publishedDate}</span>
							</div>
						)}
					</div>
				</div>

				{blog.excerpt && (
					<p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 line-clamp-3">
						{blog.excerpt}
					</p>
				)}

				<Link to="/blog/$slug" params={{ slug: blog.slug }}>
					<Button
						variant="ghost"
						className="w-full rounded-[25px] hover:scale-105 transition-all duration-300 group/btn"
						style={{ backgroundColor: "#F4631E", color: "#fff" }}
					>
						Read More
						<ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
					</Button>
				</Link>
			</div>
		</Card>
	);
}

export function BlogSection() {
	const blogs = useQuery(api.blogs.listPublished);

	return (
		<section className="py-8 md:py-16 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
			{/* Decorative background elements */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-chart-2/5 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
			</div>

			{/* Floating decorative icons */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="hidden md:block absolute top-20 left-10">
					<Sparkles className="w-10 h-10 text-yellow-400 opacity-20 animate-pulse" />
				</div>
				<div className="hidden md:block absolute top-40 right-20">
					<BookOpen className="w-12 h-12 text-blue-400 opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
				</div>
			</div>

			<div className="container mx-auto px-4 md:px-6 relative z-10">
				{/* Header */}
				<div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4">
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm md:text-base font-bold text-primary mb-2 md:mb-4">
						<BookOpen className="w-4 h-4 md:w-5 md:h-5" />
						<span>Our Blog</span>
					</div>
					<h1 className="text-4xl md:text-6xl lg:text-7xl font-black">
						<span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
							Stories & Insights
						</span>
						<br />
						<span className="text-foreground">From Lalli Fafa</span>
					</h1>
					<p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
						Discover tips, stories, and updates about early childhood learning, storytelling, and the adventures of Lalli and Fafa
					</p>
				</div>

				{/* Blog Cards */}
				{blogs === undefined ? (
					<div className="text-center py-12">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : blogs.length === 0 ? (
					<div className="text-center py-12">
						<Card className="inline-block p-8 bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-[30px]">
							<BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
							<p className="text-lg text-muted-foreground font-medium">
								No blog posts available yet. Check back soon!
							</p>
						</Card>
					</div>
				) : (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-7xl mx-auto">
						{blogs.map((blog) => (
							<BlogCard key={blog._id} blog={blog} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
