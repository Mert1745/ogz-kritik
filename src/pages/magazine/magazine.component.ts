import {Component, computed, signal, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DetailedIndexService} from '../../services/detailed-index.service';
import {DetailedIndex} from '../../interface';
import {PaginatorModule, PaginatorState} from 'primeng/paginator';
import {CardModule} from 'primeng/card';
import {MAGAZINE_URL} from '../../constants/magazine';

@Component({
    selector: 'app-magazine',
    standalone: true,
    imports: [CommonModule, PaginatorModule, CardModule],
    templateUrl: './magazine.component.html',
    styleUrls: ['./magazine.component.css']
})
export class MagazineComponent {
    allMagazineItems: Signal<DetailedIndex[]>;
    first = signal(0);
    rows = 50;

    // Paginated items
    paginatedItems: Signal<DetailedIndex[]>;
    groupedPaginatedItems: Signal<{ year: string; items: DetailedIndex[] }[]>;

    constructor(private detailedIndexService: DetailedIndexService) {
        this.allMagazineItems = this.detailedIndexService.detailedIndex;

        // Paginated items based on current page
        this.paginatedItems = computed(() => {
            const items = this.allMagazineItems();
            const start = this.first();
            const end = this.first() + this.rows;
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

    onPageChange(event: PaginatorState): void {
        this.first.set(event.first ?? 0);
        this.rows = event.rows ?? 50;
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
}


