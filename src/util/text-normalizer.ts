/**
 * Helper function to normalize strings for Turkish/English comparison
 * Handles the Turkish capital I issue (I vs ı)
 * Removes both lowercase 'i' and lowercase 'ı' (Turkish dotless i)
 * @param str The string to normalize
 * @returns Normalized string for comparison
 */
export function normalizeForComparison(str: string): string {
    return str
        .toLocaleLowerCase('tr-TR')
        .replace(/i/g, '') // Remove lowercase i
        .replace(/ı/g, ''); // Remove lowercase ı (Turkish dotless i)
}
