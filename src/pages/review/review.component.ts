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

    constructor(private detailedIndexService: DetailedIndexService) {
        this.itemsReview = computed(() =>
            this.detailedIndexService.detailedIndex()
                .filter(item => item.section === 'İnceleme')
        );

        this.paginatedItems = computed(() =>
            this.itemsReview().slice(this.first(), this.first() + this.rows)
        );
    }

    onPageChange(event: PaginatorState) {
        this.first.set(event.first ?? 0);
    }
}

