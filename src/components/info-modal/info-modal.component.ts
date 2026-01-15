import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-info-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './info-modal.component.html',
    styleUrls: ['./info-modal.component.css']
})
export class InfoModalComponent {
    @Input() showModal = false;
    @Output() closeModalEvent = new EventEmitter<void>();

    closeModal(): void {
        this.closeModalEvent.emit();
    }
}
