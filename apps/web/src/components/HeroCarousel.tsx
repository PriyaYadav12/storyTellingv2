import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Slide {
	type: "image" | "video";
	src: string;
	alt?: string;
	caption?: string;
}

interface HeroCarouselProps {
	slides?: Slide[];
	autoPlayInterval?: number;
}

export default function HeroCarousel({ 
	slides = [
		{ type: "image", src: "/LalliFafadashboard1.jpeg", alt: "Lalli and Fafa", caption: "Meet Lalli & Fafa!" },
		{ type: "image", src: "/LalliFafadashboard2.jpeg", alt: "Lalli", caption: "Adventure Awaits!" },
		{ type: "video", src: "/LalliVideo.mp4", caption:"Lalli,6" },
		{ type: "video", src: "/FafaVideo.mp4", caption: "Fafa,3" },
	],
	autoPlayInterval = 5000 
}: HeroCarouselProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

	useEffect(() => {
		// Use 7 seconds (7000ms) for video slides, otherwise use autoPlayInterval
		const currentSlideType = slides[currentSlide]?.type;
		const interval = currentSlideType === "video" ? 7000 : autoPlayInterval;

		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % slides.length);
		}, interval);

		return () => clearInterval(timer);
	}, [currentSlide, slides.length, autoPlayInterval, slides]);

	// Handle video playback when slide changes
	useEffect(() => {
		videoRefs.current.forEach((video, index) => {
			if (video && slides[index]?.type === "video") {
				if (index === currentSlide) {
					// Reset video to start
					video.currentTime = 0;
					// Try to play with audio first
					video.muted = false;
					video.play().then(() => {
						// Successfully started playing, keep unmuted
						video.muted = false;
					}).catch(() => {
						// If autoplay with sound fails, try muted autoplay
						video.muted = true;
						video.play().catch((err) => {
							console.log("Video autoplay failed:", err);
						});
					});
				} else {
					video.pause();
					video.currentTime = 0;
					video.muted = true;
				}
			}
		});
	}, [currentSlide, slides]);

	const goToSlide = (index: number) => {
		setCurrentSlide(index);
	};

	const goToPrevious = () => {
		setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
	};

	const goToNext = () => {
		setCurrentSlide((prev) => (prev + 1) % slides.length);
	};

	return (
		<div className="relative w-full h-[50vh] md:h-[60vh] rounded-3xl overflow-hidden">
			{/* Soft Pastel Animated Gradient Background */}
			<div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-chart-3/20 animate-gradient bg-[length:200%_200%]">
				<style>{`
					@keyframes gradient {
						0% { background-position: 0% 50%; }
						50% { background-position: 100% 50%; }
						100% { background-position: 0% 50%; }
					}
					.animate-gradient {
						animation: gradient 15s ease infinite;
					}
				`}</style>
			</div>

			{/* Floating Particles */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				{Array.from({ length: 20 }).map((_, i) => (
					<div
						key={`star-${i}`}
						className="absolute text-primary/30 animate-float"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 5}s`,
							animationDuration: `${3 + Math.random() * 4}s`,
							fontSize: `${0.5 + Math.random() * 1}rem`,
						}}
					>
						{Math.random() > 0.5 ? '✨' : '⭐'}
					</div>
				))}
				{Array.from({ length: 8 }).map((_, i) => (
					<div
						key={`cloud-${i}`}
						className="absolute text-accent/20 animate-float-slow"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 3}s`,
							animationDuration: `${8 + Math.random() * 4}s`,
							fontSize: `${1.5 + Math.random() * 1}rem`,
						}}
					>
						☁️
					</div>
				))}
				<style>{`
					@keyframes float {
						0%, 100% { transform: translate(0, 0) rotate(0deg); }
						25% { transform: translate(20px, -20px) rotate(5deg); }
						50% { transform: translate(-15px, -40px) rotate(-5deg); }
						75% { transform: translate(-20px, -20px) rotate(3deg); }
					}
					@keyframes float-slow {
						0%, 100% { transform: translate(0, 0) rotate(0deg); }
						33% { transform: translate(30px, -30px) rotate(3deg); }
						66% { transform: translate(-30px, -60px) rotate(-3deg); }
					}
					.animate-float {
						animation: float linear infinite;
					}
					.animate-float-slow {
						animation: float-slow linear infinite;
					}
				`}</style>
			</div>

			<div className="relative w-full h-full z-10">
				{slides.map((slide, index) => (
					<div
						key={index}
						className={`absolute inset-0 transition-opacity duration-700 ${
							index === currentSlide ? "opacity-100" : "opacity-0"
						}`}
					>
						{slide.type === "image" ? (
							<div className="relative w-full h-full flex items-center justify-center p-4">
								<img
									src={slide.src}
									alt={slide.alt}
									className="max-w-full max-h-full object-contain z-10 rounded-2xl shadow-lg"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
								{slide.caption && (
									<div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white pointer-events-none z-20">
										<h2 className="text-4xl md:text-6xl font-bold text-center drop-shadow-lg">
											{slide.caption}
										</h2>
									</div>
								)}
							</div>
						) : (
							<div className="relative w-full h-full flex items-center justify-center p-4">
								<video
									ref={(el) => {
										videoRefs.current[index] = el;
									}}
									src={slide.src}
									className="max-w-full max-h-full object-contain z-10 rounded-2xl shadow-lg"
									autoPlay
									playsInline
									muted
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
								{slide.caption && (
									<div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white pointer-events-none z-20">
										<h2 className="text-4xl md:text-6xl font-bold text-center drop-shadow-lg">
											{slide.caption}
										</h2>
									</div>
								)}
							</div>
						)}
					</div>
				))}
			</div>

			<Button
				size="icon"
				variant="outline"
				className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white z-30"
				onClick={goToPrevious}
				data-testid="button-carousel-prev"
			>
				<ChevronLeft className="w-6 h-6" />
			</Button>

			<Button
				size="icon"
				variant="outline"
				className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white z-30"
				onClick={goToNext}
				data-testid="button-carousel-next"
			>
				<ChevronRight className="w-6 h-6" />
			</Button>

			<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
				{slides.map((_, index) => (
					<button
						key={index}
						onClick={() => goToSlide(index)}
						className={`w-3 h-3 rounded-full transition-all ${
							index === currentSlide
								? "bg-white w-8"
								: "bg-white/50 hover:bg-white/75"
						}`}
						data-testid={`button-dot-${index}`}
					/>
				))}
			</div>
		</div>
	);
}

