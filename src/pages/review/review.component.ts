import {Component, computed, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DetailedIndexService} from '../../services/detailed-index.service';
import {DetailedIndex} from '../../interface';

@Component({
    selector: 'app-review',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.css']
})
export class ReviewComponent {
    itemsReview: Signal<DetailedIndex[]>;

    constructor(private detailedIndexService: DetailedIndexService) {
        this.itemsReview = computed(() =>
            this.detailedIndexService.detailedIndex()
                .filter(item => item.section === 'İnceleme')
        );
    }
}

