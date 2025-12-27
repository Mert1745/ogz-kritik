import {Component, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {CommonModule} from '@angular/common';
import {TooltipModule} from 'primeng/tooltip';
import {RippleModule} from 'primeng/ripple';
import {ExcelCacheService} from '../services/excel-cache.service';
import {HeaderComponent} from '../components/header/header.component';

@Component({
    selector: 'app-root',
    imports: [ButtonModule, CardModule, CommonModule, TooltipModule, RippleModule, HeaderComponent, RouterOutlet],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App implements OnInit {
    protected readonly title = signal('ogz-kritik');
    excelData: any[] = [];
    loading = true;

    constructor(private excelCache: ExcelCacheService) {
    }

    async ngOnInit() {
        try {
            this.excelData = await this.excelCache.getExcelData();
            this.loading = false;
        } catch (error) {
            console.error('Failed to load Excel data:', error);
            this.loading = false;
        }
    }
}
