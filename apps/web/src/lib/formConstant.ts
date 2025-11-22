import { Castle, Rocket, Waves, Rainbow, Palette, Trees, Home, Cookie, type LucideIcon} from "lucide-react";
import { Heart, Shield, Users, Smile, Brain, Target, Star, Lightbulb, HandHeart, Handshake, Sparkles } from "lucide-react";

// Map theme names to icons and colors
export const getThemeMetadata = (themeName: string): { icon: LucideIcon; color: "pink" | "blue" | "yellow" | "purple" | "green" } => {
	const lowerName = themeName.toLowerCase();
	
	// Map based on keywords in theme name
	if (lowerName.includes("forest") || lowerName.includes("nature") || lowerName.includes("jungle")) {
		return { icon: Trees, color: "green" };
	}
	if (lowerName.includes("ocean") || lowerName.includes("sea") || lowerName.includes("water")) {
		return { icon: Waves, color: "blue" };
	}
	if (lowerName.includes("space") || lowerName.includes("galaxy") || lowerName.includes("planet")) {
		return { icon: Rocket, color: "blue" };
	}
	if (lowerName.includes("castle") || lowerName.includes("kingdom") || lowerName.includes("princess")) {
		return { icon: Castle, color: "pink" };
	}
	if (lowerName.includes("rainbow") || lowerName.includes("magic") || lowerName.includes("wonder")) {
		return { icon: Rainbow, color: "purple" };
	}
	if (lowerName.includes("art") || lowerName.includes("paint") || lowerName.includes("creative")) {
		return { icon: Palette, color: "yellow" };
	}
	if (lowerName.includes("bakery") || lowerName.includes("cookie") || lowerName.includes("cake")) {
		return { icon: Cookie, color: "pink" };
	}
	if (lowerName.includes("building") || lowerName.includes("workshop") || lowerName.includes("home")) {
		return { icon: Home, color: "purple" };
	}
	
	// Default fallback
	return { icon: Trees, color: "green" };
};

// Map lesson names to icons
export const getLessonMetadata = (lessonName: string): { icon: LucideIcon } => {
	const lowerName = lessonName.toLowerCase().trim();
	
	// Map based on keywords in lesson name
	if (lowerName.includes("kindness")) {
		return { icon: Heart };
	}
	if (lowerName.includes("sharing")) {
		return { icon: HandHeart };
	}
	if (lowerName.includes("honesty")) {
		return { icon: Smile };
	}
	if (lowerName.includes("courage") || lowerName.includes("brave")) {
		return { icon: Shield };
	}
	if (lowerName.includes("teamwork") || lowerName.includes("together")) {
		return { icon: Users };
	}
	if (lowerName.includes("caring") && lowerName.includes("animal")) {
		return { icon: HandHeart };
	}
	if (lowerName.includes("respect")) {
		return { icon: Shield };
	}
	if (lowerName.includes("gratitude") || lowerName.includes("thankful")) {
		return { icon: Sparkles };
	}
	if (lowerName.includes("friendship") || lowerName.includes("friend")) {
		return { icon: Handshake };
	}
	if (lowerName.includes("helping") || lowerName.includes("help")) {
		return { icon: HandHeart };
	}
	if (lowerName.includes("problem") && lowerName.includes("solv")) {
		return { icon: Brain };
	}
	if (lowerName.includes("perseverance") || lowerName.includes("persist")) {
		return { icon: Target };
	}
	if (lowerName.includes("creativity") || lowerName.includes("creative")) {
		return { icon: Star };
	}
	if (lowerName.includes("empathy") || lowerName.includes("understand")) {
		return { icon: Lightbulb };
	}
	
	// Default fallback
	return { icon: Heart };
};

