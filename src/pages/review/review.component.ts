import {Component, computed, signal, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DetailedIndexService} from '../../services/detailed-index.service';
import {DetailedIndex} from '../../interface';
import {PaginatorModule, PaginatorState} from 'primeng/paginator';
import {CardModule} from 'primeng/card';

@Component({
    selector: 'app-review',
    standalone: true,
    imports: [CommonModule, PaginatorModule, CardModule],
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.css']
})
export class ReviewComponent {
    itemsReview: Signal<DetailedIndex[]>;
    first = signal(0);
    rows = 50;

    paginatedItems: Signal<DetailedIndex[]>;

    // Stats
    totalReviews: Signal<number>;
    totalAuthors: Signal<number>;
    averageScore: Signal<number | null>;

    constructor(private detailedIndexService: DetailedIndexService) {
        this.itemsReview = computed(() =>
            this.detailedIndexService.detailedIndex()
                .filter(item => item.section === 'İnceleme')
        );

        this.paginatedItems = computed(() =>
            this.itemsReview().slice(this.first(), this.first() + this.rows)
        );

        this.totalReviews = computed(() => this.itemsReview().length);

        this.totalAuthors = computed(() => {
            const authors = new Set<string>();
            this.itemsReview().forEach(item => {
                item.authors?.forEach(author => authors.add(author));
            });
            return authors.size;
        });

        this.averageScore = computed(() => {
            const items = this.itemsReview();
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

    onPageChange(event: PaginatorState) {
        this.first.set(event.first ?? 0);
    }
}

