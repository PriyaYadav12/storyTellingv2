import { useState, useMemo } from "react";
import type { Doc } from "@story-telling-v2/backend/convex/_generated/dataModel";

export interface TransformedStory {
	id: string;
	title: string;
	theme: string;
	childName: string;
	adventure: string;
	language: string;
	createdAt: string;
	readingTime: string;
}

const STORIES_PER_PAGE = 6;

export function useStoriesFilter(stories: Doc<"stories">[] | undefined) {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterTheme, setFilterTheme] = useState<string>("all");
	const [filterLanguage, setFilterLanguage] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);

	// Transform stories for display
	const transformedStories = useMemo(() => {
		if (!stories) return [];
		return stories.map((story: Doc<"stories">) => ({
			id: story._id,
			title: story.title || "Untitled Story",
			theme: (story.params?.theme as string) || "Adventure",
			childName: story.params?.childName || "Child",
			adventure: (story.params?.theme as string) || "Adventure",
			language: (story.params?.language as string) || "English",
			createdAt: story._creationTime ? new Date(story._creationTime).toLocaleDateString() : "Unknown",
			readingTime: "5 min", // Approximate
		}));
	}, [stories]);

	// Filter stories
	const filteredStories = useMemo(() => {
		return transformedStories.filter((story) => {
			const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
								story.adventure.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesTheme = filterTheme === "all" || story.theme === filterTheme;
			const matchesLanguage = filterLanguage === "all" || story.language === filterLanguage;

			return matchesSearch && matchesTheme && matchesLanguage;
		});
	}, [transformedStories, searchQuery, filterTheme, filterLanguage]);

	// Pagination calculations
	const totalPages = Math.ceil(filteredStories.length / STORIES_PER_PAGE);
	const startIndex = (currentPage - 1) * STORIES_PER_PAGE;
	const endIndex = startIndex + STORIES_PER_PAGE;
	const paginatedStories = filteredStories.slice(startIndex, endIndex);

	// Reset to page 1 when filters change
	const handleFilterChange = () => {
		setCurrentPage(1);
	};

	// Clear all filters
	const clearFilters = () => {
		setSearchQuery("");
		setFilterTheme("all");
		setFilterLanguage("all");
		setCurrentPage(1);
	};

	// Get unique themes and languages
	const themes = useMemo(() => {
		const uniqueThemes = new Set(transformedStories.map(s => s.theme));
		return Array.from(uniqueThemes);
	}, [transformedStories]);

	const languages = useMemo(() => {
		const uniqueLanguages = new Set(transformedStories.map(s => s.language));
		return Array.from(uniqueLanguages);
	}, [transformedStories]);

	// Check if any filters are active
	const hasActiveFilters = searchQuery || filterTheme !== "all" || filterLanguage !== "all";

	return {
		// State
		searchQuery,
		filterTheme,
		filterLanguage,
		currentPage,
		
		// Setters
		setSearchQuery,
		setFilterTheme,
		setFilterLanguage,
		setCurrentPage,
		
		// Computed values
		transformedStories,
		filteredStories,
		paginatedStories,
		totalPages,
		startIndex,
		endIndex,
		themes,
		languages,
		hasActiveFilters,
		
		// Actions
		handleFilterChange,
		clearFilters,
	};
}
