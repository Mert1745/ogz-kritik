import {Injectable, signal, computed, inject} from '@angular/core';
import {DetailedIndexService} from './detailed-index.service';
import {DetailedIndex} from '../interface';
import {REVIEW} from '../constants';
import {normalizeForComparison} from '../util/text-normalizer';

@Injectable({
    providedIn: 'root'
})
export class MagazineFilterService {
    private detailedIndexService = inject(DetailedIndexService);

    // Default year range
    private readonly defaultMinYear = 2007;
    private readonly defaultMaxYear = 2025;

    // Filter signals
    readonly sectionFilter = signal<string[]>([]);
    readonly titleFilter = signal<string>('');
    readonly authorFilter = signal<string>('');
    readonly yearRange = signal<[number, number]>([this.defaultMinYear, this.defaultMaxYear]);
    readonly excludeReviews = signal<boolean>(false);
    readonly viewMode = signal<'article' | 'magazine'>('magazine');

    // Track actual data bounds
    private dataMinYear = signal<number>(this.defaultMinYear);
    private dataMaxYear = signal<number>(this.defaultMaxYear);

    // All magazine items from the service
    readonly allItems = this.detailedIndexService.detailedIndex;

    // Year bounds computed from data
    readonly minYear = computed(() => {
        const years = this.allItems()
            .map(item => parseInt(item.releaseMonthYear.year, 10))
            .filter(y => !isNaN(y));
        return years.length > 0 ? Math.min(...years) : this.defaultMinYear;
    });

    readonly maxYear = computed(() => {
        const years = this.allItems()
            .map(item => parseInt(item.releaseMonthYear.year, 10))
            .filter(y => !isNaN(y));
        return years.length > 0 ? Math.max(...years) : this.defaultMaxYear;
    });

    // All unique values for autocomplete
    readonly allSections = computed(() => {
        const sections = new Set<string>();
        this.allItems().forEach(item => {
            if (item.section) sections.add(item.section);
        });
        return [...sections].sort((a, b) => a.localeCompare(b, 'tr-TR'));
    });

    readonly allAuthors = computed(() => {
        const authors = new Set<string>();
        this.allItems().forEach(item => {
            item.authors?.forEach(author => authors.add(author));
        });
        return [...authors].sort((a, b) => a.localeCompare(b, 'tr-TR'));
    });


    // Private method to apply filter logic to items
    private applyFilters(items: DetailedIndex[], includeYearFilter: boolean = true): DetailedIndex[] {
        const sections = this.sectionFilter();
        const title = this.titleFilter().trim();
        const author = this.authorFilter().trim();
        const [minYr, maxYr] = this.yearRange();
        const excludeReviewItems = this.excludeReviews();

        // Normalize title and author for comparison
        const normalizedTitle = normalizeForComparison(title);
        const normalizedAuthor = normalizeForComparison(author);

        return items.filter(item => {
            // Exclude reviews filter
            if (excludeReviewItems && item.section?.toLocaleLowerCase('tr-TR') === REVIEW.toLocaleLowerCase('tr-TR')) {
                return false;
            }

            // Section filter (multi-select)
            if (sections.length > 0 && !sections.includes(item.section)) {
                return false;
            }

            // Title filter
            if (title && item.title) {
                const itemTitle = normalizeForComparison(String(item.title));
                if (!itemTitle.includes(normalizedTitle)) {
                    return false;
                }
            }

            // Author filter
            if (author && !item.authors?.some(a => normalizeForComparison(a).includes(normalizedAuthor))) {
                return false;
            }

            // Year filter (optional)
            if (includeYearFilter) {
                const year = parseInt(item.releaseMonthYear.year, 10);
                if (!isNaN(year) && (year < minYr || year > maxYr)) {
                    return false;
                }
            }

            return true;
        });
    }

    // Apply all filters
    readonly filteredItems = computed(() => {
        return this.applyFilters(this.allItems(), true);
    });

    // Magazine view - get unique items by id (one per magazine issue)
    readonly uniqueMagazineItems = computed(() => {
        const items = this.filteredItems();
        const seen = new Set<number>();
        return items.filter(item => {
            if (seen.has(item.id)) {
                return false;
            }
            seen.add(item.id);
            return true;
        });
    });

    // Filter items by magazine ID
    getFilteredItemsByMagazineId(magazineId: number | null): DetailedIndex[] {
        if (magazineId === null) return [];

        const items = this.allItems().filter(item => item.id === magazineId);

        // Apply global filters (excluding year filter since all items in a magazine have the same year)
        return this.applyFilters(items, false);
    }

    // Group items by year
    groupItemsByYear(items: DetailedIndex[]): { year: string; items: DetailedIndex[] }[] {
        const grouped = new Map<string, DetailedIndex[]>();

        items.forEach(item => {
            const year = item.releaseMonthYear.year;
            if (!grouped.has(year)) {
                grouped.set(year, []);
            }
            grouped.get(year)!.push(item);
        });

        return Array.from(grouped.entries())
            .map(([year, items]) => ({ year, items }))
            .sort((a, b) => parseInt(b.year) - parseInt(a.year));
    }


    // Computed to check if any filter is active
    readonly hasActiveFilters = computed(() => {
        const [minYr, maxYr] = this.yearRange();
        const dataMin = this.dataMinYear();
        const dataMax = this.dataMaxYear();

        return this.sectionFilter().length > 0 ||
            this.titleFilter().trim() !== '' ||
            this.authorFilter().trim() !== '' ||
            minYr !== dataMin ||
            maxYr !== dataMax ||
            this.excludeReviews();
    });

    // Update methods
    setSectionFilter(sections: string[]): void {
        this.sectionFilter.set(sections ?? []);
    }

    setTitleFilter(title: string): void {
        this.titleFilter.set(title ?? '');
    }

    setAuthorFilter(author: string): void {
        this.authorFilter.set(author ?? '');
    }

    setYearRange(range: [number, number]): void {
        this.yearRange.set(range);
    }

    setExcludeReviews(exclude: boolean): void {
        this.excludeReviews.set(exclude);
    }

    setViewMode(mode: 'article' | 'magazine'): void {
        this.viewMode.set(mode);
    }

    // Reset all filters
    resetFilters(): void {
        this.sectionFilter.set([]);
        this.titleFilter.set('');
        this.authorFilter.set('');
        this.yearRange.set([this.dataMinYear(), this.dataMaxYear()]);
        this.excludeReviews.set(false);
    }
}
