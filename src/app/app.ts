import {Component, inject, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {CommonModule} from '@angular/common';
import {TooltipModule} from 'primeng/tooltip';
import {RippleModule} from 'primeng/ripple';
import {ExcelCacheService} from '../services/excel-cache.service';
import {GameMappingService} from '../services/game-mapping.service';
import {HeaderComponent} from '../components/header/header.component';
import {LoadingComponent} from '../components/loading/loading.component';
import {FooterComponent} from '../components/footer/footer.component';
import {AnalyticsService} from '../services/analytics.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ButtonModule, CardModule, CommonModule, TooltipModule, RippleModule, HeaderComponent, RouterOutlet, LoadingComponent, FooterComponent],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App implements OnInit {
    protected readonly title = signal('ogz-kritik');
    private analytics = inject(AnalyticsService);

    excelData: any[] = [];

    constructor(
        private excelCache: ExcelCacheService,
        private gameMappingService: GameMappingService
    ) {
    }

    async ngOnInit() {
        try {
            this.analytics.initPageTracking();

            await Promise.all([
                this.excelCache.getExcelData().then(data => this.excelData = data),
                this.gameMappingService.fetchGameMapping()
            ]);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }
}
