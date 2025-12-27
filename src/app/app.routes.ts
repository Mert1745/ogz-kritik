import { Routes } from '@angular/router';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { ReviewComponent } from '../pages/review/review.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'review', component: ReviewComponent },
];
