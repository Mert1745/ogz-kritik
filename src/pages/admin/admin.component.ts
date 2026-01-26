import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../../services/upload-service';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent {
    password = '';
    selectedFile: File | null = null;
    uploading = false;
    message = '';
    messageType: 'success' | 'error' | '' = '';

    constructor(private uploadService: UploadService) {}

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.message = '';
            this.messageType = '';
        }
    }

    async onUpload(): Promise<void> {
        if (!this.selectedFile || !this.password) {
            return;
        }

        this.uploading = true;
        this.message = '';
        this.messageType = '';

        try {
            await this.uploadService.uploadExcelFile(this.selectedFile, this.password);
            this.message = 'Dosya başarıyla yüklendi!';
            this.messageType = 'success';
            this.selectedFile = null;
            this.password = '';
            // Reset file input
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
        } catch (error) {
            this.message = error instanceof Error ? error.message : 'Yükleme başarısız oldu';
            this.messageType = 'error';
        } finally {
            this.uploading = false;
        }
    }
}
