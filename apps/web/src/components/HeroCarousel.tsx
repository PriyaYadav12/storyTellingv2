import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "@tanstack/react-router";

interface Slide {
	id: number;
	img: string;
	title: string;
	subtitle: string;
}

interface HeroCarouselProps {
	slides?: Slide[];
}

export default function HeroCarousel({
	slides = [
		{
			id: 1,
			img: "/Hero-carousel1.png",
			title: "Unleash Your Imagination",
			subtitle: "Join Lalli & Fafa on magical adventures!",
		},
		{
			id: 2,
			img: "/Hero-carousel2.png",
			title: "Create Your Own Stories",
			subtitle: "Become the hero of your own fairytale.",
		},
	],
}: HeroCarouselProps) {
	const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
	const navigate = useNavigate();
	const location = useLocation();

	const handleStartAdventure = () => {
		const isOnDashboard = location.pathname === "/dashboard";
		
		if (!isOnDashboard) {
			void navigate({ to: "/dashboard" });
			// Scroll after navigation completes - use retry mechanism for reliability
			const scrollToForm = () => {
				const formSection = document.getElementById("section-story-form");
				if (formSection) {
					formSection.scrollIntoView({ behavior: "smooth" });
				} else {
					// Retry if element not found yet (navigation may still be in progress)
					setTimeout(scrollToForm, 100);
				}
			};
			setTimeout(scrollToForm, 200);
		} else {
			// Already on dashboard, just scroll
			document.getElementById("section-story-form")?.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<div className="relative w-full overflow-hidden rounded-lg md:rounded-[3rem] shadow-2xl bg-gray-900">
			<style>{`
				@keyframes fadeIn {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}
			`}</style>
			<div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

			<div className="embla" ref={emblaRef}>
				<div className="flex h-[280px] sm:h-[350px] md:h-[500px] lg:h-[700px]">
					{slides.map((slide) => (
						<div className="flex-[0_0_100%] min-w-0 relative" key={slide.id}>
							<img
								src={slide.img}
								alt={slide.title}
								className="w-full h-full object-cover"
							/>
							<div className="absolute inset-0 z-30 flex flex-col justify-center items-center text-center text-white p-4 sm:p-6 md:p-8">
								<h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold mb-2 sm:mb-3 md:mb-4 drop-shadow-lg opacity-0 animate-[fadeIn_0.7s_ease-in-out_0.1s_both]">
									{slide.title}
								</h1>
								<p className="text-sm sm:text-base md:text-xl lg:text-2xl max-w-2xl mb-4 sm:mb-6 md:mb-8 drop-shadow-md opacity-0 animate-[fadeIn_0.7s_ease-in-out_0.3s_both]">
									{slide.subtitle}
								</p>
								<button
									onClick={handleStartAdventure}
									className="group relative px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-accent text-accent-foreground font-bold text-sm sm:text-base md:text-lg rounded-full shadow-lg shadow-accent/20 hover:scale-105 transition-all duration-300 flex items-center gap-2 opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.5s_both]"
								>
									Start Your Adventure
									<ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
								</button>
							</div>
						</div>
					))}
				</div>				
			</div>
		</div>
	);
}
