
export interface Index {
    id: string;   // indicates the issue number of the magazine
    releaseYearMonth: string;
    section: string;
    title: string;
    authors: string;
    scoreIn100: string;
    scoreIn10: string;
    scoreIn5: string;
}


export interface DetailedIndex {
    id: number;
    releaseMonthYear: Map<Set<string>, string>;
    section: string;
    title: string;
    authors?: Set<string>;
    scoreIn100?: number;
    scoreIn10?: number;
    scoreIn5?: number;
}
