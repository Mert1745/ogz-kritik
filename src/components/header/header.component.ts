import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ButtonModule} from 'primeng/button';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, ButtonModule, NgOptimizedImage],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    @Input() title: string = '';
}

