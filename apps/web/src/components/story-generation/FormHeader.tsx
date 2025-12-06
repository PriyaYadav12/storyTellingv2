import { Sparkles } from "lucide-react";

export default function FormHeader() {
	return (
		<div className="text-center space-y-2">
			<div className="flex items-center justify-center gap-3">
				<Sparkles className="w-10 h-10 text-primary" />
				<h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					Create Your Next Adventure
				</h2>
			</div>
			<p className="text-xl text-muted-foreground">
				Choose a theme and a lesson to learn!
			</p>
		</div>
	);
}
