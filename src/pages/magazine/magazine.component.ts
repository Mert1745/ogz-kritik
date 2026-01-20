import {Component, computed, OnInit, signal, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {DetailedIndexService} from '../../services/detailed-index.service';
import {DetailedIndex} from '../../interface';
import {PaginatorModule, PaginatorState} from 'primeng/paginator';
import {CardModule} from 'primeng/card';
import {AutoCompleteModule, AutoCompleteCompleteEvent} from 'primeng/autocomplete';
import {SliderModule} from 'primeng/slider';
import {CheckboxModule} from 'primeng/checkbox';
import {InputTextModule} from 'primeng/inputtext';
import {formatMonths} from '../../util/index-mapper';
import {ArticleViewCardsComponent} from '../../components/article-view-cards/article-view-cards.component';

@Component({
    selector: 'app-magazine',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginatorModule, CardModule, AutoCompleteModule, SliderModule, CheckboxModule, InputTextModule, ArticleViewCardsComponent],
    templateUrl: './magazine.component.html',
    styleUrls: ['./magazine.component.css']
})
export class MagazineComponent implements OnInit {
    allMagazineItems: Signal<DetailedIndex[]>;
    first = signal(0);
    rows = signal(50);

    // Filter visibility for mobile
    isFilterVisible = signal(false);

    // View mode: 'article' or 'magazine'
    viewMode = signal<'article' | 'magazine'>('magazine');

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

    // Magazine view - unique items by id
    uniqueMagazineItems: Signal<DetailedIndex[]>;
    paginatedMagazineItems: Signal<DetailedIndex[]>;
    groupedPaginatedMagazineItems: Signal<{ year: string; items: DetailedIndex[] }[]>;

    constructor(private detailedIndexService: DetailedIndexService, private router: Router) {
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

        // Magazine view - get unique items by id (one per magazine issue)
        this.uniqueMagazineItems = computed(() => {
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

        // Paginated magazine items
        this.paginatedMagazineItems = computed(() => {
            const items = this.uniqueMagazineItems();
            const start = this.first();
            const end = this.first() + this.rows();
            return items.slice(start, end);
        });

        // Group magazine items by year
        this.groupedPaginatedMagazineItems = computed(() => {
            const items = this.paginatedMagazineItems();
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

    ngOnInit(): void {
    }

    toggleFilter() {
        this.isFilterVisible.set(!this.isFilterVisible());
    }

    toggleViewMode() {
        this.viewMode.set(this.viewMode() === 'article' ? 'magazine' : 'article');
        this.first.set(0);
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
        this.router.navigate(['/magazine', id]);
    }


    protected readonly formatMonths = formatMonths;
}
