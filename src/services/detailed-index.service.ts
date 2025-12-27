import {Injectable} from '@angular/core';
import {DetailedIndex} from '../interface';

@Injectable({
    providedIn: 'root'
})
export class DetailedIndexService {
    private _detailedIndex: DetailedIndex[] = [];

    get detailedIndex(): DetailedIndex[] {
        return this._detailedIndex;
    }

    set detailedIndex(value: DetailedIndex[]) {
        this._detailedIndex = value;
    }

    clear(): void {
        this._detailedIndex = [];
    }
}

