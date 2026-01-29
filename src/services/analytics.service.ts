import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private router = inject(Router);

    initPageTracking() {
        // Track initial page load
        this.trackPageView(window.location.pathname);

        // Track route changes
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.trackPageView(event.urlAfterRedirects);
        });
    }

    trackPageView(url: string) {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-TZPG1WFMKM', {
                page_path: url
            });
        }
    }
}
