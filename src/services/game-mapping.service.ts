import {Injectable, signal} from '@angular/core';
import {GAME_MAPPING_URL} from '../constants/aws';

interface GameMapping {
    image_id: number;
    index_name: string;
    igdb_name: string;
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
            return;
        }

        try {
            const response = await fetch(GAME_MAPPING_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: GameMappingResponse = await response.json();

            const mappingMap = new Map<number, string[]>();
            data.games.forEach(game => {
                if (!mappingMap.has(game.image_id)) {
                    mappingMap.set(game.image_id, []);
                }
                mappingMap.get(game.image_id)!.push(game.index_name);
            });

            this.gameMapping.set(mappingMap);
            this.isFetched = true;
        } catch (error) {
            console.error('Error fetching game mapping:', error);
            throw error;
        }
    }
}
