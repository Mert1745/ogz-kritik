import {Component, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {GtagModule} from 'angular-gtag';
import {Gtag} from 'angular-gtag';
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

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ButtonModule, CardModule, CommonModule, TooltipModule, RippleModule, HeaderComponent,
        RouterOutlet, LoadingComponent, FooterComponent, GtagModule.forRoot({
            trackingId: 'G-TZPG1WFMKM',
            trackPageviews: true
        })],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App implements OnInit {
    protected readonly title = signal('ogz-kritik');
    excelData: any[] = [];

    constructor(
        private excelCache: ExcelCacheService,
        private gameMappingService: GameMappingService,
        private gtag: Gtag
    ) {
        this.gtag.event('screen_view', {
            'app_name': 'ogzKritik',
            'screen_name': 'Home'
        });
    }

    async ngOnInit() {
        try {
            await Promise.all([
                this.excelCache.getExcelData().then(data => this.excelData = data),
                this.gameMappingService.fetchGameMapping()
            ]);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }
}
