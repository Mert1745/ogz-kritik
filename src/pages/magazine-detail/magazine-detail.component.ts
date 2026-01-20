import {Component, computed, OnInit, signal, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {DetailedIndexService} from '../../services/detailed-index.service';
import {MagazineFilterService} from '../../services/magazine-filter.service';
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

    // Filter signals from service
    hasActiveFilters: Signal<boolean>;

    // Filtered items by magazine ID and global filters
    filteredItems: Signal<DetailedIndex[]>;
    groupedItems: Signal<{ year: string; items: DetailedIndex[] }[]>;

    // Magazine info
    magazineInfo: Signal<{ id: number; title: string; url?: string } | null>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private detailedIndexService: DetailedIndexService,
        private magazineFilterService: MagazineFilterService
    ) {
        // Bind hasActiveFilters from service
        this.hasActiveFilters = this.magazineFilterService.hasActiveFilters;

        // Filter items by magazine ID and apply global filters
        this.filteredItems = computed(() => {
            return this.magazineFilterService.getFilteredItemsByMagazineId(this.magazineId());
        });

        // Group items by year
        this.groupedItems = computed(() => {
            return this.magazineFilterService.groupItemsByYear(this.filteredItems());
        });

        // Get magazine info (uses unfiltered items to always show magazine info)
        this.magazineInfo = computed(() => {
            const id = this.magazineId();
            if (id === null) return null;

            const firstItem = this.magazineFilterService.allItems().find(item => item.id === id);
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
    }

    openMagazine(id: number): void {
        const magazine = MAGAZINE_URL.find(m => m.index === id);
        if (magazine?.url) {
            window.open(magazine.url, '_blank');
        }
    }

    goBack(): void {
        this.router.navigate(['/magazine']);
    }

    openMagazinePdf(): void {
        const info = this.magazineInfo();
        if (info?.url) {
            window.open(info.url, '_blank');
        }
    }

    clearFilters(): void {
        this.magazineFilterService.resetFilters();
    }
}
