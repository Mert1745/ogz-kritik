import {Injectable, signal} from '@angular/core';
import {DetailedIndex} from '../interface';

@Injectable({
    providedIn: 'root'
})
export class DetailedIndexService {
    readonly detailedIndex = signal<DetailedIndex[]>([]);

    setDetailedIndex(value: DetailedIndex[]): void {
        this.detailedIndex.set(value);
    }

    clear(): void {
        this.detailedIndex.set([]);
    }
}

