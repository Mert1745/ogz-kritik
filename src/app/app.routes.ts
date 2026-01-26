import { Routes } from '@angular/router';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { ReviewComponent } from '../pages/review/review.component';
import { MagazineComponent } from '../pages/magazine/magazine.component';
import { MagazineDetailComponent } from '../pages/magazine-detail/magazine-detail.component';
import { AuthorComponent } from '../pages/author/author.component';
import { AdminComponent } from '../pages/admin/admin.component';
import { NotFoundComponent } from '../pages/not-found/not-found.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'review', component: ReviewComponent },
    { path: 'magazine', component: MagazineComponent },
    { path: 'magazine/:id', component: MagazineDetailComponent },
    { path: 'author', component: AuthorComponent },
    { path: 'admin', component: AdminComponent },
    { path: '**', component: NotFoundComponent },
];
