import {Injectable, PLATFORM_ID, inject, signal} from '@angular/core';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';

const STORAGE_KEY = 'theme';
const DARK_CLASS = 'app-dark';

@Injectable({providedIn: 'root'})
export class ThemeService {
    private document = inject(DOCUMENT);
    private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    readonly dark = signal(this.document.documentElement.classList.contains(DARK_CLASS));

    toggle() {
        this.set(!this.dark());
    }

    private set(dark: boolean) {
        this.dark.set(dark);
        this.document.documentElement.classList.toggle(DARK_CLASS, dark);
        if (this.isBrowser) {
            try {
                localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
            } catch {
            }
        }
    }
}
