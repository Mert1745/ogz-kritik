import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardModule} from 'primeng/card';
import {DetailedIndex} from '../../interface';
import {formatMonths} from '../../util/index-mapper';

@Component({
    selector: 'app-article-view-cards',
    standalone: true,
    imports: [CommonModule, CardModule],
    templateUrl: './article-view-cards.component.html',
    styleUrls: ['./article-view-cards.component.css']
})
export class ArticleViewCardsComponent {
    @Input() groupedItems: { year: string; items: DetailedIndex[] }[] = [];
    @Input() onCardClick: (id: number) => void = () => {};
    @Input() dividerOn!: boolean;

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
        if (item.scoreIn100) return item.scoreIn100;
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
