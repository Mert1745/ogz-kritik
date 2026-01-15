import {Component, computed, Signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import {InfoModalComponent} from '../info-modal/info-modal.component';
import {DetailedIndexService} from '../../services/detailed-index.service';
import {REVIEW} from '../../constants';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, NgOptimizedImage, RouterLink, InfoModalComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
    showModal = false;
    averageScore: Signal<number>;
    currentYear = new Date().getFullYear();
    latestIssue: Signal<number>;

    constructor(private detailedIndexService: DetailedIndexService) {
        this.averageScore = computed(() => {
            const items = this.detailedIndexService.detailedIndex();
            // Filter reviews with scores
            const reviewsWithScores = items.filter(item =>
                item.section === REVIEW &&
                (item.scoreIn100 !== undefined || item.scoreIn10 !== undefined || item.scoreIn5 !== undefined)
            );

            if (reviewsWithScores.length === 0) {
                return 0;
            }

            // Calculate average (prioritize scoreIn100, then scoreIn10, then scoreIn5)
            let totalScore = 0;
            let count = 0;

            reviewsWithScores.forEach(item => {
                if (item.scoreIn100 !== undefined) {
                    totalScore += item.scoreIn100;
                    count++;
                } else if (item.scoreIn10 !== undefined) {
                    totalScore += item.scoreIn10;
                    count++;
                } else if (item.scoreIn5 !== undefined) {
                    totalScore += item.scoreIn5 * 20;
                    count++;
                }
            });

            return count > 0 ? Math.round((totalScore / count) * 10) / 10 : 0;
        });

        this.latestIssue = computed(() => {
            const items = this.detailedIndexService.detailedIndex();
            if (items.length === 0) return 0;

            const issueNumbers = items.map(item => item.id).filter(id => !isNaN(id) && id > 0);
            return issueNumbers.length > 0 ? Math.max(...issueNumbers) : 0;
        });
    }

    openModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }
}
