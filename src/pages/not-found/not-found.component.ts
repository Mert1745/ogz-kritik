import {Component} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, NgOptimizedImage],
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {
}

