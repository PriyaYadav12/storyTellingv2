import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { StoryFilters } from "@/components/stories/StoryFilters";
import { StoriesGrid } from "@/components/stories/StoriesGrid";
import { Pagination } from "@/components/stories/Pagination";
import { EmptyStoriesState } from "@/components/stories/EmptyStoriesState";
import { useStoriesFilter } from "@/hooks/useStoriesFilter";

interface AdminStoriesProps {
	handlePlayStory: (id: string) => void;
}

export function AdminStories({ handlePlayStory }: AdminStoriesProps) {
    const stories = useQuery(api.stories.listAll);
    const {
		searchQuery,
		filterTheme,
		filterLanguage,
		currentPage,
		setSearchQuery,
		setFilterTheme,
		setFilterLanguage,
		setCurrentPage,
		filteredStories,
		paginatedStories,
		totalPages,
		startIndex,
		endIndex,
		themes,
		languages,
		hasActiveFilters,
		handleFilterChange,
		clearFilters,
	} = useStoriesFilter(stories);
    return (
        <>
        <StoryFilters
            searchQuery={searchQuery}
            filterTheme={filterTheme}
            filterLanguage={filterLanguage}
            themes={themes}
            languages={languages}
            hasActiveFilters={hasActiveFilters as boolean}
            onSearchChange={setSearchQuery}
            onThemeChange={setFilterTheme}
            onLanguageChange={setFilterLanguage}
            onClearFilters={clearFilters}
            onFilterChange={handleFilterChange}
        />

        <div>
            <p className="text-muted-foreground mb-4">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredStories.length)} of {filteredStories.length} stories
            </p>
            <StoriesGrid stories={paginatedStories} onPlayStory={handlePlayStory} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>

        {filteredStories.length === 0 && <EmptyStoriesState />}
    </>
    );
}