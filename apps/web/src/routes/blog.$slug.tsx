import React from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import Output from "editorjs-react-renderer";

export const Route = createFileRoute("/blog/$slug")({
	component: BlogPostComponent,
});

function BlogPostComponent() {
	const { slug } = Route.useParams();
	const navigate = useNavigate();
	const blog = useQuery(api.blogs.getBySlug, { slug });

	if (blog === undefined) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					<p className="mt-4 text-muted-foreground">Loading blog post...</p>
				</div>
			</div>
		);
	}

	if (!blog) {
		return <Navigate to="/blog" />;
	}

	const publishedDate = blog.publishedAt
		? new Date(blog.publishedAt).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
		  })
		: null;

	// Custom renderers to match the design system
	const customRenderers = {
	paragraph: ({ data }: any) => (
		<p 
			className="mb-4 text-base md:text-lg leading-relaxed text-foreground"
			dangerouslySetInnerHTML={{ __html: data.text }}
		/>
	),
		header: ({ data }: any) => {
			const level = Math.min(Math.max(data.level || 2, 1), 6);
			const headingTags: Record<number, React.ElementType> = {
				1: "h1",
				2: "h2",
				3: "h3",
				4: "h4",
				5: "h5",
				6: "h6",
			};
			const Tag = headingTags[level] || "h2";
			return React.createElement(
				Tag,
				{ className: "font-black mb-4 mt-8 text-foreground" },
				data.text
			);
		},
	list: ({ data }: any) => {
		const ListTag = data.style === "ordered" ? "ol" : "ul";
		
		const renderListItem = (item: any, index: number): React.ReactNode => {
			// Handle both string items and object items with {content, items, meta}
			const content = typeof item === "string" ? item : item.content;
			const nestedItems = typeof item === "object" && item.items ? item.items : null;
			
			return (
				<li key={index} className="text-base md:text-lg text-foreground mb-2">
					{content && (
						<span dangerouslySetInnerHTML={{ __html: content }} />
					)}
					{nestedItems && nestedItems.length > 0 && (
						<ListTag className="ml-6 mt-2 space-y-1">
							{nestedItems.map((nestedItem: any, nestedIndex: number) =>
								renderListItem(nestedItem, nestedIndex)
							)}
						</ListTag>
					)}
				</li>
			);
		};
		
		return React.createElement(
			ListTag,
			{ className: `${data.style === "ordered" ? "list-decimal" : "list-disc"} list-inside mb-4 space-y-2` },
			data.items?.map((item: any, i: number) => renderListItem(item, i))
		);
	},
		quote: ({ data }: any) => (
			<blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
				{data.text}
				{data.caption && (
					<cite className="block mt-2 text-sm not-italic">— {data.caption}</cite>
				)}
			</blockquote>
		),
		code: ({ data }: any) => (
			<pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
				<code className="text-sm">{data.code}</code>
			</pre>
		),
		image: ({ data }: any) => (
			<div className="my-6">
				<img
					src={data.file?.url || data.url}
					alt={data.caption || ""}
					className="rounded-lg w-full"
				/>
				{data.caption && (
					<p className="text-sm text-muted-foreground mt-2 text-center">{data.caption}</p>
				)}
			</div>
		),
		table: ({ data }: any) => (
			<div className="overflow-x-auto my-6">
				<table className="min-w-full border-collapse border border-border">
					<tbody>
						{data.content?.map((row: string[], i: number) => (
							<tr key={i}>
								{row.map((cell: string, j: number) => (
									<td
										key={j}
										className="border border-border p-2 text-foreground"
									>
										{cell}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		),
		delimiter: () => (
			<div className="flex items-center justify-center my-8">
				<div className="w-16 h-1 bg-primary rounded-full"></div>
			</div>
		),
		warning: ({ data }: any) => (
			<div className="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-400 p-4 my-4 rounded">
				<div className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
					{data.title || "Warning"}
				</div>
				<div className="text-yellow-700 dark:text-yellow-300">{data.message}</div>
			</div>
		),
		checklist: ({ data }: any) => (
			<ul className="list-none space-y-2 my-4">
				{data.items?.map((item: any, i: number) => (
					<li key={i} className="flex items-start gap-2">
						<input
							type="checkbox"
							checked={item.checked}
							readOnly
							className="mt-1"
						/>
						<span className="text-foreground">{item.text}</span>
					</li>
				))}
			</ul>
		),
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
				{/* Back Button */}
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/blog" })}
					className="mb-6 rounded-[25px] hover:scale-105 transition-all duration-300"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Blog
				</Button>

				{/* Blog Post */}
				<Card className="p-6 md:p-10 bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-[30px] max-w-4xl mx-auto">
					{/* Header */}
					<div className="mb-6 md:mb-8">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
								<BookOpen className="w-6 h-6 md:w-7 md:h-7 text-white" />
							</div>
							{publishedDate && (
								<div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
									<Calendar className="w-4 h-4 md:w-5 md:h-5" />
									<span>{publishedDate}</span>
								</div>
							)}
						</div>
						<h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
							{blog.title}
						</h1>
						{blog.excerpt && (
							<p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
								{blog.excerpt}
							</p>
						)}
					</div>

					{/* Content */}
					<div className="prose prose-lg max-w-none">
						{blog.content && typeof blog.content === "object" && "blocks" in blog.content ? (
							<Output data={blog.content} renderers={customRenderers} />
						) : blog.content && typeof blog.content === "string" ? (
							<div dangerouslySetInnerHTML={{ __html: blog.content }} />
						) : (
							<p className="text-muted-foreground">Content not available</p>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
