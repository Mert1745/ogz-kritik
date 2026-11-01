import {Component, Input, OnInit, PLATFORM_ID, inject, signal} from '@angular/core';
import {ThemeService} from '../../services/theme.service';
import {CommonModule, NgOptimizedImage, isPlatformBrowser} from '@angular/common';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {filter} from 'rxjs';

const HINT_KEY = 'darkThemeHintSeen';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, ButtonModule, NgOptimizedImage, RouterLink],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    @Input() title: string = '';
    protected theme = inject(ThemeService);
    private router = inject(Router);
    private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    protected showHint = signal(false);

    ngOnInit() {
        if (!this.isBrowser || this.hintSeen()) {
            return;
        }
        this.router.events
            .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
            .subscribe(e => this.showHint.set(!this.hintSeen() && e.urlAfterRedirects.split(/[?#]/)[0] === '/'));
    }

    protected toggleTheme() {
        this.dismissHint();
        this.theme.toggle();
    }

    protected dismissHint() {
        this.showHint.set(false);
        try {
            localStorage.setItem(HINT_KEY, '1');
        } catch {
        }
    }

    private hintSeen(): boolean {
        try {
            return localStorage.getItem(HINT_KEY) === '1';
        } catch {
            return false;
        }
    }
}
