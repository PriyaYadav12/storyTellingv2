import { createFileRoute } from "@tanstack/react-router";
import { FAQSection } from "@/components/landing/FAQSection";

export const Route = createFileRoute("/faq")({
	component: FAQComponent,
});

function FAQComponent() {
	return (
		<div className="min-h-screen bg-background">
			<FAQSection />
		</div>
	);
}
