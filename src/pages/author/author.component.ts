import {Component, computed, signal, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DetailedIndexService} from '../../services/detailed-index.service';
import {DetailedIndex} from '../../interface';
import {ChartModule} from 'primeng/chart';
import {AutoCompleteModule, AutoCompleteCompleteEvent} from 'primeng/autocomplete';
import {CardModule} from 'primeng/card';
import {SliderModule} from 'primeng/slider';
import {REVIEW} from '../../constants';
import {formatMonths} from '../../util/index-mapper';

interface AuthorStats {
    author: string;
    count: number;
}

interface AuthorCardData {
    name: string;
    totalItems: number;
    firstArticle: string;
    sectionCounts: { section: string; count: number }[];
}

@Component({
    selector: 'app-author',
    standalone: true,
    imports: [CommonModule, FormsModule, ChartModule, AutoCompleteModule, CardModule, SliderModule],
    templateUrl: './author.component.html',
    styleUrls: ['./author.component.css']
})
export class AuthorComponent {
    allItems: Signal<DetailedIndex[]>;
    topAuthors: Signal<AuthorStats[]>;
    topReviewAuthors: Signal<AuthorStats[]>;
    chartData: Signal<any>;
    reviewChartData: Signal<any>;
    chartOptions: any;
    reviewChartOptions: any;

    // Author search
    selectedAuthors = signal<string[]>([]);
    authorSuggestions = signal<string[]>([]);
    allAuthors: Signal<string[]>;
    authorCards: Signal<AuthorCardData[]>;

    // Year range filter for charts
    allAuthorsYearRange = signal<[number, number]>([2007, 2025]);
    reviewAuthorsYearRange = signal<[number, number]>([2007, 2025]);
    minYear: Signal<number>;
    maxYear: Signal<number>;
    filteredItemsForAllAuthors: Signal<DetailedIndex[]>;
    filteredItemsForReviewAuthors: Signal<DetailedIndex[]>;

    constructor(private detailedIndexService: DetailedIndexService) {
        this.allItems = this.detailedIndexService.detailedIndex;

        // Calculate year bounds
        this.minYear = computed(() => {
            const years = this.allItems()
                .map(item => parseInt(item.releaseMonthYear.year, 10))
                .filter(y => !isNaN(y));
            return years.length > 0 ? Math.min(...years) : 2007;
        });

        this.maxYear = computed(() => {
            const years = this.allItems()
                .map(item => parseInt(item.releaseMonthYear.year, 10))
                .filter(y => !isNaN(y));
            return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
        });

        // Filter items by year range for all authors chart
        this.filteredItemsForAllAuthors = computed(() => {
            const items = this.allItems();
            const [minYr, maxYr] = this.allAuthorsYearRange();
            return items.filter(item => {
                const year = parseInt(item.releaseMonthYear.year, 10);
                return !isNaN(year) && year >= minYr && year <= maxYr;
            });
        });

        // Filter items by year range for review authors chart
        this.filteredItemsForReviewAuthors = computed(() => {
            const items = this.allItems();
            const [minYr, maxYr] = this.reviewAuthorsYearRange();
            return items.filter(item => {
                const year = parseInt(item.releaseMonthYear.year, 10);
                return !isNaN(year) && year >= minYr && year <= maxYr;
            });
        });

        // Get all unique authors
        this.allAuthors = computed(() => {
            const items = this.allItems();
            const authors = new Set<string>();
            items.forEach(item => {
                item.authors?.forEach(author => authors.add(author));
            });
            return [...authors].sort();
        });

        // Generate author cards for selected authors
        this.authorCards = computed(() => {
            const selected = this.selectedAuthors();
            const items = this.allItems();

            return selected.map(authorName => {
                // Get all items by this author
                const authorItems = items.filter(item =>
                    item.authors?.includes(authorName)
                );

                // Get first article (earliest by magazine ID)
                const firstItem = authorItems.reduce((earliest, current) =>
                    current.id < earliest.id ? current : earliest
                , authorItems[0]);

                const firstArticle = firstItem
                    ? `${firstItem.title} (#${firstItem.id} - ${formatMonths(firstItem.releaseMonthYear.months)} ${firstItem.releaseMonthYear.year})`
                    : '-';

                // Count articles by section
                const sectionCountsMap = new Map<string, number>();
                authorItems.forEach(item => {
                    const section = item.section || 'Diğer';
                    sectionCountsMap.set(section, (sectionCountsMap.get(section) || 0) + 1);
                });

                const sectionCounts = Array.from(sectionCountsMap.entries())
                    .map(([section, count]) => ({ section, count }))
                    .sort((a, b) => b.count - a.count);

                return {
                    name: authorName,
                    totalItems: authorItems.length,
                    firstArticle,
                    sectionCounts
                };
            });
        });

        // Calculate top 10 authors by number of items (filtered by year)
        this.topAuthors = computed(() => {
            const items = this.filteredItemsForAllAuthors();
            const authorCounts = new Map<string, number>();

            // Count items per author
            items.forEach(item => {
                if (item.authors && item.authors.length > 0) {
                    item.authors.forEach(author => {
                        const count = authorCounts.get(author) || 0;
                        authorCounts.set(author, count + 1);
                    });
                }
            });

            // Convert to array and sort by count
            const authorStats: AuthorStats[] = Array.from(authorCounts.entries())
                .map(([author, count]) => ({author, count}))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            return authorStats;
        });

        // Calculate top 10 authors from Review section only (filtered by year)
        this.topReviewAuthors = computed(() => {
            const items = this.filteredItemsForReviewAuthors();
            const authorCounts = new Map<string, number>();

            // Count items per author, only for review section
            items.forEach(item => {
                if (item.section === REVIEW && item.authors && item.authors.length > 0) {
                    item.authors.forEach(author => {
                        const count = authorCounts.get(author) || 0;
                        authorCounts.set(author, count + 1);
                    });
                }
            });

            // Convert to array and sort by count
            const authorStats: AuthorStats[] = Array.from(authorCounts.entries())
                .map(([author, count]) => ({author, count}))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            return authorStats;
        });

        // Prepare chart data
        this.chartData = computed(() => {
            const authors = this.topAuthors();
            return {
                labels: authors.map(a => a.author),
                datasets: [
                    {
                        label: 'Yazı Sayısı',
                        data: authors.map(a => a.count),
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 159, 64, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 159, 64, 0.6)'
                        ],
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }
                ]
            };
        });

        this.reviewChartData = computed(() => {
            const authors = this.topReviewAuthors();
            return {
                labels: authors.map(a => a.author),
                datasets: [
                    {
                        label: 'İnceleme Sayısı',
                        data: authors.map(a => a.count),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(255, 159, 64, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(201, 203, 207, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(255, 159, 64, 0.6)',
                            'rgba(255, 206, 86, 0.6)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(201, 203, 207, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 1
                    }
                ]
            };
        });

        // Chart options
        this.chartOptions = {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'En Çok Yazı Yazanlar',
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    padding: {
                        top: 20,
                        bottom: 30
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 14
                        }
                    },
                },
                y: {
                    ticks: {
                        font: {
                            size: 14
                        }
                    },
                }
            }
        };

        this.reviewChartOptions = {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'En Çok Oyun İnceleyenler',
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    padding: {
                        top: 20,
                        bottom: 30
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 14
                        }
                    },
                },
                y: {
                    ticks: {
                        font: {
                            size: 14
                        }
                    },
                }
            }
        };
    }

    searchAuthors(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLocaleLowerCase('tr-TR');
        this.authorSuggestions.set(
            this.allAuthors().filter(author =>
                author.toLocaleLowerCase('tr-TR').includes(query)
            )
        );
    }

    onAuthorsChange(value: string[]) {
        this.selectedAuthors.set(value || []);
    }

    onAllAuthorsYearRangeChange(value: [number, number]) {
        this.allAuthorsYearRange.set(value);
    }

    onReviewAuthorsYearRangeChange(value: [number, number]) {
        this.reviewAuthorsYearRange.set(value);
    }
}
