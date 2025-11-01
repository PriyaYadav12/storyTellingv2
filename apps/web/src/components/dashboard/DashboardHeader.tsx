import React from "react";

export function DashboardHeader() {
	return (
		<div className="mb-8 text-center">
			<h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-3">
				Your Story Dashboard
			</h1>
			<p className="text-lg text-muted-foreground">
				Welcome back! Ready for today's adventure?
			</p>
		</div>
	);
}