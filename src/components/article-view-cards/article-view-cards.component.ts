import {Component, Input} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {CardModule} from 'primeng/card';
import {DetailedIndex} from '../../interface';
import {formatMonths} from '../../util/index-mapper';
import {GameMappingService} from '../../services/game-mapping.service';
import {REVIEW} from '../../constants';

@Component({
    selector: 'app-article-view-cards',
    standalone: true,
    imports: [CommonModule, CardModule, NgOptimizedImage],
    templateUrl: './article-view-cards.component.html',
    styleUrls: ['./article-view-cards.component.css']
})
export class ArticleViewCardsComponent {
    @Input() groupedItems: { year: string; items: DetailedIndex[] }[] = [];
    @Input() onCardClick: (id: number) => void = () => {};
    @Input() dividerOn!: boolean;

    constructor(private gameMappingService: GameMappingService) {
    }

    hasScore(item: DetailedIndex): boolean {
        return item.section === REVIEW || !!(item.scoreIn100 || item.scoreIn10 || item.scoreIn5);
    }

    getDisplayScore(item: DetailedIndex): string | null {
        if (item.scoreIn100) return item.scoreIn100.toString();
        if (item.scoreIn10) return item.scoreIn10.toString();
        if (item.scoreIn5) return item.scoreIn5.toString();
        if (item.section === REVIEW) return "-";
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

    getAppIdByTitle(title: string): number | null {
        const gameMap = this.gameMappingService.gameMapping();
        for (const [appid, gameNames] of gameMap.entries()) {
            if (gameNames.some(gameName =>
                gameName.toLocaleLowerCase('en-US').trim() === title.toLocaleLowerCase('en-US').trim()
            )) {
                return appid;
            }
        }
        return null;
    }

    protected readonly formatMonths = formatMonths;
}
