import {Component, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {CommonModule} from '@angular/common';
import {TooltipModule} from 'primeng/tooltip';
import {RippleModule} from 'primeng/ripple';
import {ExcelCacheService} from '../services/excel-cache.service';
import {HeaderComponent} from '../components/header/header.component';
import {LoadingComponent} from '../components/loading/loading.component';

@Component({
    selector: 'app-root',
    imports: [ButtonModule, CardModule, CommonModule, TooltipModule, RippleModule, HeaderComponent, RouterOutlet, LoadingComponent],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App implements OnInit {
    protected readonly title = signal('ogz-kritik');
    excelData: any[] = [];

    constructor(private excelCache: ExcelCacheService) {
    }

    async ngOnInit() {
        try {
            this.excelData = await this.excelCache.getExcelData();
        } catch (error) {
            console.error('Failed to load Excel data:', error);
        }
    }
}
