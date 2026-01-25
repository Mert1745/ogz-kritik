import {Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {GAME_MAPPING_URL} from '../constants/aws';

interface GameMapping {
    appid: number;
    name: string;
}

interface GameMappingResponse {
    created_at: string;
    total_matches: number;
    games: GameMapping[];
}

@Injectable({
    providedIn: 'root'
})
export class GameMappingService {
    readonly gameMapping = signal<Map<number, string[]>>(new Map());

    constructor(private http: HttpClient) {}

    async fetchGameMapping(): Promise<void> {
        try {
            const response = await firstValueFrom(
                this.http.get<GameMappingResponse>(GAME_MAPPING_URL)
            );

            const mappingMap = new Map<number, string[]>();
            response.games.forEach(game => {
                if (!mappingMap.has(game.appid)) {
                    mappingMap.set(game.appid, []);
                }
                mappingMap.get(game.appid)!.push(game.name);
            });

            this.gameMapping.set(mappingMap);
        } catch (error) {
            console.error('Error fetching game mapping:', error);
            throw error;
        }
    }

    clear(): void {
        this.gameMapping.set(new Map());
    }
}
