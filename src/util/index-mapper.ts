import {DetailedIndex} from '../interface';
import {
    DATE,
    ISSUE_NUMBER,
    SECTION,
    AUTHOR,
    CONTENT,
    SCORE_5,
    SCORE_10,
    SCORE_100,
    INVALID_VALUES_IN_SCORE_10
} from '../constants';


export function mapIndexToDetailedIndex(index: any[]): DetailedIndex[] {
    return index.map((item) => {
        const monthsYear = item[DATE]?.split('/')
        const year = monthsYear && monthsYear[0]
        const months = monthsYear && monthsYear[1].split('-')

        const detailedIndex: DetailedIndex = {
            id: parseInt(item[ISSUE_NUMBER], 10),
            releaseMonthYear: {
                year: year,
                months: months,
            },
            section: item[SECTION],
            title: item[CONTENT],
        };

        if (item[AUTHOR] && item[AUTHOR] !== '-') {
            detailedIndex.authors = item[AUTHOR].split(' - ');
        }

        if (item[SCORE_100] && item[SCORE_100] !== '-') {
            detailedIndex.scoreIn100 = parseFloat(item[SCORE_100].replace(',', '.'));
        }

        if (item[SCORE_10] && !INVALID_VALUES_IN_SCORE_10.includes(item[SCORE_10]))
        {
            const withoutPlus = item[SCORE_10].toString().replace('+', '').replace(',', '.'); // Remove plus sign if exists
            detailedIndex.scoreIn10 = parseFloat(withoutPlus);
        }

        if (item[SCORE_5] && item[SCORE_5] !== '-') {
            detailedIndex.scoreIn5 = parseFloat(item[SCORE_5].toString().replace(',', '.'));
        }

        return detailedIndex;
    });
}
