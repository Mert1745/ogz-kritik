import {Component, computed, signal, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DetailedIndexService} from '../../services/detailed-index.service';
import {DetailedIndex} from '../../interface';
import {PaginatorModule, PaginatorState} from 'primeng/paginator';
import {CardModule} from 'primeng/card';
import {AutoCompleteModule, AutoCompleteCompleteEvent} from 'primeng/autocomplete';
import {SliderModule} from 'primeng/slider';
import {CheckboxModule} from 'primeng/checkbox';
import {InputTextModule} from 'primeng/inputtext';
import {MAGAZINE_URL} from '../../constants/magazine';
import {formatMonths} from '../../util/index-mapper';

@Component({
    selector: 'app-magazine',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginatorModule, CardModule, AutoCompleteModule, SliderModule, CheckboxModule, InputTextModule],
    templateUrl: './magazine.component.html',
    styleUrls: ['./magazine.component.css']
})
export class MagazineComponent {
    allMagazineItems: Signal<DetailedIndex[]>;
    first = signal(0);
    rows = signal(50);

    // Filter visibility for mobile
    isFilterVisible = signal(false);

    // Filters
    sectionFilter = signal<string[]>([]);
    sectionSuggestions = signal<string[]>([]);
    titleFilter = signal('');
    titleSuggestions = signal<string[]>([]);
    authorFilter = signal('');
    authorSuggestions = signal<string[]>([]);
    yearRange = signal<[number, number]>([2007, 2025]);
    excludeReviews = signal(false);

    // All unique values for autocomplete
    allSections: Signal<string[]>;
    allTitles: Signal<string[]>;
    allAuthors: Signal<string[]>;

    // Year bounds
    minYear: Signal<number>;
    maxYear: Signal<number>;

    // Filtered items
    filteredItems: Signal<DetailedIndex[]>;
    paginatedItems: Signal<DetailedIndex[]>;
    groupedPaginatedItems: Signal<{ year: string; items: DetailedIndex[] }[]>;

    constructor(private detailedIndexService: DetailedIndexService) {
        this.allMagazineItems = this.detailedIndexService.detailedIndex;

        // Extract unique sections for autocomplete
        this.allSections = computed(() => {
            const sections = new Set<string>();
            this.allMagazineItems().forEach(item => {
                if (item.section) sections.add(item.section);
            });
            return [...sections].sort((a, b) => a.localeCompare(b, 'tr-TR'));
        });

        // Extract unique titles for autocomplete
        this.allTitles = computed(() => {
            const titles = new Set<string>();
            this.allMagazineItems().forEach(item => {
                if (item.title) titles.add(item.title);
            });
            return [...titles].sort((a, b) => a.localeCompare(b, 'tr-TR'));
        });

        // Extract unique authors for autocomplete
        this.allAuthors = computed(() => {
            const authors = new Set<string>();
            this.allMagazineItems().forEach(item => {
                item.authors?.forEach(author => authors.add(author));
            });
            return [...authors].sort((a, b) => a.localeCompare(b, 'tr-TR'));
        });

        // Calculate year bounds from data
        this.minYear = computed(() => {
            const years = this.allMagazineItems()
                .map(item => parseInt(item.releaseMonthYear.year, 10))
                .filter(y => !isNaN(y));
            return years.length > 0 ? Math.min(...years) : 2007;
        });

        this.maxYear = computed(() => {
            const years = this.allMagazineItems()
                .map(item => parseInt(item.releaseMonthYear.year, 10))
                .filter(y => !isNaN(y));
            return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
        });

        // Apply all filters
        this.filteredItems = computed(() => {
            const items = this.allMagazineItems();
            const sections = this.sectionFilter();
            const title = this.titleFilter().toLocaleLowerCase('tr-TR').trim();
            const author = this.authorFilter().toLocaleLowerCase('tr-TR').trim();
            const [minYr, maxYr] = this.yearRange();
            const excludeReviewItems = this.excludeReviews();

            return items.filter(item => {
                // Exclude reviews filter
                if (excludeReviewItems && item.section?.toLocaleLowerCase('tr-TR') === 'inceleme') {
                    return false;
                }

                // Section filter (multi-select)
                if (sections.length > 0 && !sections.includes(item.section)) {
                    return false;
                }

                // Title filter
                if (title && !item.title.toLocaleLowerCase('tr-TR').includes(title)) {
                    return false;
                }

                // Author filter
                if (author && !item.authors?.some(a => a.toLocaleLowerCase('tr-TR').includes(author))) {
                    return false;
                }

                // Year filter
                const year = parseInt(item.releaseMonthYear.year, 10);
                return !(!isNaN(year) && (year < minYr || year > maxYr));
            });
        });

        // Paginated items based on current page
        this.paginatedItems = computed(() => {
            const items = this.filteredItems();
            const start = this.first();
            const end = this.first() + this.rows();
            return items.slice(start, end);
        });

        // Group items by year
        this.groupedPaginatedItems = computed(() => {
            const items = this.paginatedItems();
            const grouped = new Map<string, DetailedIndex[]>();

            items.forEach(item => {
                const year = item.releaseMonthYear.year;
                if (!grouped.has(year)) {
                    grouped.set(year, []);
                }
                grouped.get(year)!.push(item);
            });

            return Array.from(grouped.entries())
                .map(([year, items]) => ({year, items}))
                .sort((a, b) => parseInt(b.year) - parseInt(a.year));
        });
    }

    toggleFilter() {
        this.isFilterVisible.set(!this.isFilterVisible());
    }

    // Section filter methods
    onSectionFilterChange(value: string[]) {
        this.sectionFilter.set(value ?? []);
        this.first.set(0);
    }

    searchSections(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLocaleLowerCase('tr-TR');
        this.sectionSuggestions.set(
            this.allSections().filter(section => section.toLocaleLowerCase('tr-TR').includes(query))
        );
    }

    // Title filter methods
    onTitleFilterChange(value: string | null) {
        this.titleFilter.set(value ?? '');
        this.first.set(0);
    }

    searchTitles(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLocaleLowerCase('tr-TR');
        this.titleSuggestions.set(
            this.allTitles().filter(title => title.toLocaleLowerCase('tr-TR').includes(query))
        );
    }

    // Author filter methods
    onAuthorFilterChange(value: string | null) {
        this.authorFilter.set(value ?? '');
        this.first.set(0);
    }

    searchAuthors(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLocaleLowerCase('tr-TR');
        this.authorSuggestions.set(
            this.allAuthors().filter(author => author.toLocaleLowerCase('tr-TR').includes(query))
        );
    }

    // Year range filter
    onYearRangeChange(value: [number, number]) {
        this.yearRange.set(value);
        this.first.set(0);
    }

    // Exclude reviews checkbox
    onExcludeReviewsChange(value: boolean) {
        this.excludeReviews.set(value);
        this.first.set(0);
    }

    onPageChange(event: PaginatorState): void {
        this.first.set(event.first ?? 0);
        this.rows.set(event.rows ?? 50);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    openMagazine(id: number): void {
        const magazine = MAGAZINE_URL.find(m => m.index === id);
        if (magazine?.url) {
            window.open(magazine.url, '_blank');
        }
    }

    hasScore(item: DetailedIndex): boolean {
        return !!(item.scoreIn100 || item.scoreIn10 || item.scoreIn5);
    }

    getDisplayScore(item: DetailedIndex): number | null {
        if (item.scoreIn100) return item.scoreIn100;
        if (item.scoreIn10) return item.scoreIn10;
        if (item.scoreIn5) return item.scoreIn5;
        return null;
    }

    getNormalizedScore(item: DetailedIndex): number | null {
        if (item.scoreIn100) return item.scoreIn100 / 10;
        if (item.scoreIn10) return item.scoreIn10;
        if (item.scoreIn5) return item.scoreIn5 * 2;
        return null;
    }

    getScoreColorClass(item: DetailedIndex): string {
        const score = this.getNormalizedScore(item);

        if (score === null || score === undefined) {
            return 'score-none';
        }

        if (score >= 8) {
            return 'score-excellent';
        } else if (score >= 6.5) {
            return 'score-good';
        } else if (score >= 5) {
            return 'score-average';
        } else {
            return 'score-poor';
        }
    }

    protected readonly formatMonths = formatMonths;
}
