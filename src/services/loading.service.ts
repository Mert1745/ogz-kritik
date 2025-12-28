import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private activeRequests = 0;

    // Signal for reactive loading state
    readonly isLoading = signal(false);

    show(): void {
        this.activeRequests++;
        this.isLoading.set(true);
    }

    hide(): void {
        this.activeRequests--;
        if (this.activeRequests <= 0) {
            this.activeRequests = 0;
            this.isLoading.set(false);
        }
    }
}
