import {Component, computed, OnInit, signal, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {MagazineFilterService} from '../../services/magazine-filter.service';
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

    // Filter signals from service (for template binding)
    sectionFilter: Signal<string[]>;
    titleFilter: Signal<string>;
    authorFilter: Signal<string>;
    yearRange: Signal<[number, number]>;
    excludeReviews: Signal<boolean>;

    // Autocomplete suggestions (local state)
    sectionSuggestions = signal<string[]>([]);
    titleSuggestions = signal<string[]>([]);
    authorSuggestions = signal<string[]>([]);

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

    constructor(
        private router: Router,
        private magazineFilterService: MagazineFilterService
    ) {
        // Bind filter signals from service
        this.sectionFilter = this.magazineFilterService.sectionFilter;
        this.titleFilter = this.magazineFilterService.titleFilter;
        this.authorFilter = this.magazineFilterService.authorFilter;
        this.yearRange = this.magazineFilterService.yearRange;
        this.excludeReviews = this.magazineFilterService.excludeReviews;

        // Bind data from service
        this.allMagazineItems = this.magazineFilterService.allItems;
        this.allSections = this.magazineFilterService.allSections;
        this.allTitles = this.magazineFilterService.allTitles;
        this.allAuthors = this.magazineFilterService.allAuthors;
        this.minYear = this.magazineFilterService.minYear;
        this.maxYear = this.magazineFilterService.maxYear;
        this.filteredItems = this.magazineFilterService.filteredItems;
        this.uniqueMagazineItems = this.magazineFilterService.uniqueMagazineItems;

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
            return this.magazineFilterService.groupItemsByYear(items);
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
            return this.magazineFilterService.groupItemsByYear(items);
        });
    }

    ngOnInit(): void {
        // Update year bounds after initial data load
        setTimeout(() => {
            const min = this.minYear();
            const max = this.maxYear();
            if (min && max) {
                this.magazineFilterService.updateYearBounds(min, max);
            }
        }, 0);
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
        this.magazineFilterService.setSectionFilter(value ?? []);
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
        this.magazineFilterService.setTitleFilter(value ?? '');
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
        this.magazineFilterService.setAuthorFilter(value ?? '');
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
        this.magazineFilterService.setYearRange(value);
        this.first.set(0);
    }

    // Exclude reviews checkbox
    onExcludeReviewsChange(value: boolean) {
        this.magazineFilterService.setExcludeReviews(value);
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
