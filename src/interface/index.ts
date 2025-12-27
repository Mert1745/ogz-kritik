export interface DetailedIndex {
    id: number;
    releaseMonthYear: ReleaseMonth;
    section: string;
    title: string;
    authors?: string[];
    scoreIn100?: number;
    scoreIn10?: number;
    scoreIn5?: number;
}

export interface ReleaseMonth {
    year: string;
    months: string[];  // This is an array because of 2023/02-03
}
