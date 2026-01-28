import {Injectable, signal} from '@angular/core';
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
    private isFetched = false;

    constructor() {}

    async fetchGameMapping(): Promise<void> {
        // Skip if already fetched in this session
        if (this.isFetched && this.gameMapping().size > 0) {
            console.log("Game mapping already loaded, skipping fetch");
            return;
        }

        console.log("Fetching game mapping from", GAME_MAPPING_URL);
        try {
            const response = await fetch(GAME_MAPPING_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: GameMappingResponse = await response.json();

            const mappingMap = new Map<number, string[]>();
            data.games.forEach(game => {
                if (!mappingMap.has(game.appid)) {
                    mappingMap.set(game.appid, []);
                }
                mappingMap.get(game.appid)!.push(game.name);
            });

            this.gameMapping.set(mappingMap);
            this.isFetched = true;
            console.log(`Game mapping loaded: ${mappingMap.size} unique appids`);
        } catch (error) {
            console.error('Error fetching game mapping:', error);
            throw error;
        }
    }

    clear(): void {
        this.gameMapping.set(new Map());
        this.isFetched = false;
    }
}
