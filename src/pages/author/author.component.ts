import {Component, computed, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DetailedIndexService} from '../../services/detailed-index.service';
import {DetailedIndex} from '../../interface';
import {ChartModule} from 'primeng/chart';
import {REVIEW} from '../../constants';

interface AuthorStats {
    author: string;
    count: number;
}

@Component({
    selector: 'app-author',
    standalone: true,
    imports: [CommonModule, ChartModule],
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

    constructor(private detailedIndexService: DetailedIndexService) {
        this.allItems = this.detailedIndexService.detailedIndex;

        // Calculate top 10 authors by number of items
        this.topAuthors = computed(() => {
            const items = this.allItems();
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

        // Calculate top 10 authors from "İnceleme" section only
        this.topReviewAuthors = computed(() => {
            const items = this.allItems();
            const authorCounts = new Map<string, number>();

            // Count items per author, only for "İnceleme" section
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
                        size: 24,
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
                    // title: {
                    //     display: true,
                    //     text: 'Yazı Sayısı',
                    //     font: {
                    //         size: 16,
                    //         weight: 'bold'
                    //     }
                    // }
                },
                y: {
                    ticks: {
                        font: {
                            size: 14
                        }
                    },
                    // title: {
                    //     display: true,
                    //     text: 'Yazar',
                    //     font: {
                    //         size: 16,
                    //         weight: 'bold'
                    //     }
                    // }
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
                        size: 24,
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
                    // title: {
                    //     display: true,
                    //     text: 'İnceleme Sayısı',
                    //     font: {
                    //         size: 16,
                    //         weight: 'bold'
                    //     }
                    // }
                },
                y: {
                    ticks: {
                        font: {
                            size: 14
                        }
                    },
                    // title: {
                    //     display: true,
                    //     text: 'Yazar',
                    //     font: {
                    //         size: 16,
                    //         weight: 'bold'
                    //     }
                    // }
                }
            }
        };
    }
}

