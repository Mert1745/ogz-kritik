import {Injectable} from '@angular/core';
import {LAMBDA_URL} from '../constants/aws';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    async uploadExcelFile(file: File, password: string): Promise<void> {
        const formData = new FormData();
        formData.append('password', password);
        formData.append('file', file);

        const response = await fetch(LAMBDA_URL, {
            method: 'POST',
            body: formData
            // Don't set Content-Type header - browser will set it with boundary
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return response.json();
    }
}
