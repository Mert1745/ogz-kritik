import {Component, computed, OnInit, signal, Signal, PLATFORM_ID, Inject} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {DetailedIndexService} from '../../services/detailed-index.service';
import {DetailedIndex} from '../../interface';
import {ArticleViewCardsComponent} from '../../components/article-view-cards/article-view-cards.component';
import {MAGAZINE_URL} from '../../constants/magazine';
import {formatMonths} from '../../util/index-mapper';

@Component({
    selector: 'app-magazine-detail',
    standalone: true,
    imports: [CommonModule, ArticleViewCardsComponent],
    templateUrl: './magazine-detail.component.html',
    styleUrls: ['./magazine-detail.component.css']
})
export class MagazineDetailComponent implements OnInit {
    magazineId = signal<number | null>(null);
    allMagazineItems: Signal<DetailedIndex[]>;

    // Filters from magazine page
    sectionFilter = signal<string[]>([]);
    titleFilter = signal('');
    authorFilter = signal('');
    yearRange = signal<[number, number]>([2007, 2025]);
    excludeReviews = signal(false);

    // Filtered items by magazine ID
    filteredItems: Signal<DetailedIndex[]>;
    groupedItems: Signal<{ year: string; items: DetailedIndex[] }[]>;

    // Magazine info
    magazineInfo: Signal<{ id: number; title: string; url?: string } | null>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private detailedIndexService: DetailedIndexService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.allMagazineItems = this.detailedIndexService.detailedIndex;

        // Filter items by magazine ID and other filters
        this.filteredItems = computed(() => {
            const id = this.magazineId();
            if (id === null) return [];

            const sections = this.sectionFilter();
            const title = this.titleFilter().toLocaleLowerCase('tr-TR').trim();
            const author = this.authorFilter().toLocaleLowerCase('tr-TR').trim();
            const [minYr, maxYr] = this.yearRange();
            const excludeReviewItems = this.excludeReviews();

            return this.allMagazineItems().filter(item => {
                // First filter: magazine ID
                if (item.id !== id) {
                    return false;
                }

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

        // Group items by year (though all will be same year for single magazine)
        this.groupedItems = computed(() => {
            const items = this.filteredItems();
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

        // Get magazine info
        this.magazineInfo = computed(() => {
            const id = this.magazineId();
            if (id === null) return null;

            const firstItem = this.filteredItems()[0];
            if (!firstItem) return null;

            const magazineUrl = MAGAZINE_URL.find(m => m.index === id);

            return {
                id: id,
                title: `#${id} - ${formatMonths(firstItem.releaseMonthYear.months)} ${firstItem.releaseMonthYear.year}`,
                url: magazineUrl?.url
            };
        });
    }

    ngOnInit(): void {
        // Get magazine ID from route params
        this.route.params.subscribe(params => {
            const id = parseInt(params['id'], 10);
            if (!isNaN(id)) {
                this.magazineId.set(id);
            } else {
                this.router.navigate(['/magazine']);
            }
        });

        // Get filters from navigation state
        // Only access history in browser environment
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state || (history.state as any);

        if (state?.filters) {
            this.sectionFilter.set(state.filters.sections || []);
            this.titleFilter.set(state.filters.title || '');
            this.authorFilter.set(state.filters.author || '');
            this.yearRange.set(state.filters.yearRange || [2007, 2025]);
            this.excludeReviews.set(state.filters.excludeReviews || false);
        }
    }

    openMagazine(id: number): void {
        const magazine = MAGAZINE_URL.find(m => m.index === id);
        if (magazine?.url) {
            window.open(magazine.url, '_blank');
        }
    }

    goBack(): void {
        this.router.navigate(['/magazine'], {
            state: {
                filters: {
                    sections: this.sectionFilter(),
                    title: this.titleFilter(),
                    author: this.authorFilter(),
                    yearRange: this.yearRange(),
                    excludeReviews: this.excludeReviews()
                }
            }
        });
    }

    openMagazinePdf(): void {
        const info = this.magazineInfo();
        if (info?.url) {
            window.open(info.url, '_blank');
        }
    }
}
