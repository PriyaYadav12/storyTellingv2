import React from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
	return (
		<div className="grid md:grid-cols-2 gap-6 mb-8">
			<Card className="hover:shadow-xl transition-all cursor-pointer border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BookOpen className="h-5 w-5 text-purple-600" />
						Read a Story
					</CardTitle>
					<CardDescription>
						Choose from our magical collection
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Explore adventures, fairy tales, and fun stories waiting for you!
					</p>
				</CardContent>
			</Card>

			<Card className="hover:shadow-xl transition-all cursor-pointer border-2 border-pink-200 dark:border-pink-800 hover:border-pink-400">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-pink-600" />
						Create a Story
					</CardTitle>
					<CardDescription>
						Let your imagination run free
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Write your own story with characters, places, and exciting plots!
					</p>
				</CardContent>
			</Card>
		</div>
	);
}