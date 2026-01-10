export const DATE = "Tarih";
export const ISSUE_NUMBER = "Sayı";
export const SECTION = "Bölüm";
export const CONTENT = "İçerik";
export const AUTHOR = "Yazar";
export const SCORE_100 = "Puan (100'lük)";
export const SCORE_10 = "Puan (10'luk)";
export const SCORE_5 = "Puan (5'lik)";

export const INVALID_VALUES_IN_SCORE_10 = ['Co-op', 'EE', 'FUO', 'Upd.', '-', ''];

export const REVIEW = "İnceleme";

export function getMonthName(monthNumber: number): string {
    const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[monthNumber - 1] || '';
}

