import {Component, computed, signal, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DetailedIndexService} from '../../services/detailed-index.service';
import {DetailedIndex} from '../../interface';
import {PaginatorModule, PaginatorState} from 'primeng/paginator';
import {CardModule} from 'primeng/card';
import {InputTextModule} from 'primeng/inputtext';
import {SliderModule} from 'primeng/slider';
import {MAGAZINE_URL} from '../../constants/magazine';

@Component({
    selector: 'app-review',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginatorModule, CardModule, InputTextModule, SliderModule],
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.css']
})
export class ReviewComponent {
    allReviewItems: Signal<DetailedIndex[]>;
    first = signal(0);
    rows = 50;

    // Filters
    authorFilter = signal('');
    titleFilter = signal('');
    scoreRange = signal<[number, number]>([0, 10]);
    yearRange = signal<[number, number]>([2000, new Date().getFullYear()]);

    // Year bounds
    minYear: Signal<number>;
    maxYear: Signal<number>;

    // Filtered items
    filteredItems: Signal<DetailedIndex[]>;
    paginatedItems: Signal<DetailedIndex[]>;

    // Stats (based on filtered items)
    totalReviews: Signal<number>;
    totalAuthors: Signal<number>;
    averageScore: Signal<number | null>;

    constructor(private detailedIndexService: DetailedIndexService) {
        this.allReviewItems = computed(() =>
            this.detailedIndexService.detailedIndex()
                .filter(item => item.section === 'İnceleme')
        );

        // Calculate year bounds from data
        this.minYear = computed(() => {
            const years = this.allReviewItems()
                .map(item => parseInt(item.releaseMonthYear.year, 10))
                .filter(y => !isNaN(y));
            return years.length > 0 ? Math.min(...years) : 2000;
        });

        this.maxYear = computed(() => {
            const years = this.allReviewItems()
                .map(item => parseInt(item.releaseMonthYear.year, 10))
                .filter(y => !isNaN(y));
            return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
        });

        // Apply all filters
        this.filteredItems = computed(() => {
            const items = this.allReviewItems();
            const author = this.authorFilter().toLowerCase().trim();
            const title = this.titleFilter().toLowerCase().trim();
            const [minScore, maxScore] = this.scoreRange();
            const [minYr, maxYr] = this.yearRange();

            return items.filter(item => {
                // Author filter
                if (author && !item.authors?.some(a => a.toLowerCase().includes(author))) {
                    return false;
                }

                // Title filter
                if (title && !item.title.toLowerCase().includes(title)) {
                    return false;
                }

                // Score filter (normalize to 0-10 scale)
                const score = this.normalizeScore(item);
                if (score !== null && (score < minScore || score > maxScore)) {
                    return false;
                }

                // Year filter
                const year = parseInt(item.releaseMonthYear.year, 10);
                if (!isNaN(year) && (year < minYr || year > maxYr)) {
                    return false;
                }

                return true;
            });
        });

        this.paginatedItems = computed(() =>
            this.filteredItems().slice(this.first(), this.first() + this.rows)
        );

        this.totalReviews = computed(() => this.filteredItems().length);

        this.totalAuthors = computed(() => {
            const authors = new Set<string>();
            this.filteredItems().forEach(item => {
                item.authors?.forEach(author => authors.add(author));
            });
            return authors.size;
        });

        this.averageScore = computed(() => {
            const items = this.filteredItems();
            const scores: number[] = [];

            items.forEach(item => {
                const score = item.scoreIn100 ?? item.scoreIn10 ?? item.scoreIn5;
                if (score !== undefined) {
                    scores.push(score);
                }
            });

            if (scores.length === 0) return null;
            return scores.reduce((sum, s) => sum + s, 0) / scores.length;
        });
    }

    private normalizeScore(item: DetailedIndex): number | null {
        if (item.scoreIn10 !== undefined) return item.scoreIn10;
        if (item.scoreIn100 !== undefined) return item.scoreIn100 / 10;
        if (item.scoreIn5 !== undefined) return item.scoreIn5 * 2;
        return null;
    }

    onAuthorFilterChange(value: string) {
        this.authorFilter.set(value);
        this.first.set(0);
    }

    onTitleFilterChange(value: string) {
        this.titleFilter.set(value);
        this.first.set(0);
    }

    onScoreRangeChange(value: [number, number]) {
        this.scoreRange.set(value);
        this.first.set(0);
    }

    onYearRangeChange(value: [number, number]) {
        this.yearRange.set(value);
        this.first.set(0);
    }

    onPageChange(event: PaginatorState) {
        this.first.set(event.first ?? 0);
    }

    openMagazine(itemId: number): void {
        const magazine = MAGAZINE_URL.find(m => m.index === itemId);
        if (magazine?.url) {
            window.open(magazine.url, '_blank');
        }
    }
}

