import {Component, Input} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ButtonModule} from 'primeng/button';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, ButtonModule, NgOptimizedImage, RouterLink],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    @Input() title: string = '';
}

