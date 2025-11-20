import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Slide {
	image: string;
	text: string;
}

interface StorySlideshowProps {
	slides: Slide[];
	onSlideChange?: (index: number) => void;
}

export default function StorySlideshow({ slides, onSlideChange }: StorySlideshowProps) {
	const [currentSlide, setCurrentSlide] = useState(0);

	const goToPrevious = () => {
		const newIndex = (currentSlide - 1 + slides.length) % slides.length;
		setCurrentSlide(newIndex);
		onSlideChange?.(newIndex);
	};

	const goToNext = () => {
		const newIndex = (currentSlide + 1) % slides.length;
		setCurrentSlide(newIndex);
		onSlideChange?.(newIndex);
	};

	if (!slides || slides.length === 0) {
		return (
			<div className="text-center text-muted-foreground">
				No slides available
			</div>
		);
	}

	return (
		<div className="space-y-6" data-testid="story-slideshow">
			<div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
				<div className="absolute inset-0 flex items-center justify-center text-8xl">
					{slides[currentSlide].image}
				</div>
			</div>

			<Card className="p-8 rounded-3xl">
				<p className="text-xl md:text-2xl leading-relaxed text-center" data-testid={`slide-text-${currentSlide}`}>
					{slides[currentSlide].text}
				</p>
			</Card>

			<div className="flex items-center justify-between">
				<Button
					size="lg"
					variant="outline"
					onClick={goToPrevious}
					disabled={slides.length <= 1}
					data-testid="button-slide-prev"
				>
					<ChevronLeft className="w-5 h-5 mr-2" />
					Previous
				</Button>

				<div className="text-muted-foreground font-medium">
					{currentSlide + 1} / {slides.length}
				</div>

				<Button
					size="lg"
					variant="outline"
					onClick={goToNext}
					disabled={slides.length <= 1}
					data-testid="button-slide-next"
				>
					Next
					<ChevronRight className="w-5 h-5 ml-2" />
				</Button>
			</div>
		</div>
	);
}

