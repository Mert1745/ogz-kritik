import { Routes } from '@angular/router';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { ReviewComponent } from '../pages/review/review.component';
import { MagazineComponent } from '../pages/magazine/magazine.component';
import { AuthorComponent } from '../pages/author/author.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'review', component: ReviewComponent },
    { path: 'magazine', component: MagazineComponent },
    { path: 'author', component: AuthorComponent },
];
