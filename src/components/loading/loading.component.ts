import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from '../../services/loading.service';

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [CommonModule, ProgressSpinnerModule],
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.css']
})
export class LoadingComponent {
    private loadingService = inject(LoadingService);

    get isLoading() {
        return this.loadingService.isLoading;
    }
}

