import {MAGAZINE_URL} from '../constants/magazine';
import {PATREON_URL} from '../constants/patreon';

/**
 * Returns the URL to read a magazine issue: the free PDF when available,
 * otherwise the Patreon post (issues 206 and above)
 * @param index The magazine issue number
 * @returns The URL, or undefined if the issue has none
 */
export function getMagazineReadUrl(index: number): string | undefined {
    return MAGAZINE_URL.find(m => m.index === index)?.url
        ?? PATREON_URL.find(m => m.index === index)?.url;
}
