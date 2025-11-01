import React from "react";
import type { Doc } from "@story-telling-v2/backend/convex/_generated/dataModel";

type Props = {
	stories: Doc<"stories">[] | undefined;
};

export function StoriesList({ stories }: Props) {
	if (stories === undefined) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!stories.length) {
		return <p className="text-sm text-muted-foreground">No stories yet. Create your first one!</p>;
	}

	return (
		<div className="space-y-3">
			{stories.map((s) => (
				<div key={s._id} className="p-3 border rounded">
					<div className="flex items-center justify-between gap-2">
						<div className="font-semibold truncate max-w-[65%]">{s.title}</div>
						<div className="text-xs opacity-70 shrink-0">{s.status}</div>
					</div>
					{s.status === "ready" && s.content && (
						<p className="text-sm mt-2 line-clamp-3 whitespace-pre-wrap">{s.content}</p>
					)}
					{s.status === "error" && s.error && (
						<p className="text-sm text-red-600 mt-2">{s.error}</p>
					)}
				</div>
			))}
		</div>
	);
}