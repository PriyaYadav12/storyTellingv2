import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface StoryFiltersProps {
	searchQuery: string;
	filterTheme: string;
	filterLanguage: string;
	themes: string[];
	languages: string[];
	hasActiveFilters: boolean;
	onSearchChange: (value: string) => void;
	onThemeChange: (value: string) => void;
	onLanguageChange: (value: string) => void;
	onClearFilters: () => void;
	onFilterChange: () => void;
}

export function StoryFilters({
	searchQuery,
	filterTheme,
	filterLanguage,
	themes,
	languages,
	hasActiveFilters,
	onSearchChange,
	onThemeChange,
	onLanguageChange,
	onClearFilters,
	onFilterChange,
}: StoryFiltersProps) {
	return (
		<Card className="p-6 rounded-3xl space-y-4">
			<div className="flex items-center gap-2">
				<Filter className="w-5 h-5 text-muted-foreground" />
				<h2 className="text-xl font-bold">Search & Filter</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
					<Input
						placeholder="Search stories..."
						value={searchQuery}
						onChange={(e) => {
							onSearchChange(e.target.value);
							onFilterChange();
						}}
						className="pl-10 rounded-xl h-12"
						data-testid="input-search"
					/>
				</div>

				<Select value={filterTheme} onValueChange={(value) => {
					onThemeChange(value);
					onFilterChange();
				}}>
					<SelectTrigger className="rounded-xl h-12" data-testid="select-filter-theme">
						<SelectValue placeholder="All Themes" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Themes</SelectItem>
						{themes.map((theme) => (
							<SelectItem key={theme} value={theme}>
								{theme}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={filterLanguage} onValueChange={(value) => {
					onLanguageChange(value);
					onFilterChange();
				}}>
					<SelectTrigger className="rounded-xl h-12" data-testid="select-filter-language">
						<SelectValue placeholder="All Languages" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Languages</SelectItem>
						{languages.map((lang) => (
							<SelectItem key={lang} value={lang}>
								{lang}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{hasActiveFilters && (
				<Button
					variant="outline"
					onClick={onClearFilters}
					data-testid="button-clear-filters"
				>
					Clear All Filters
				</Button>
			)}
		</Card>
	);
}
