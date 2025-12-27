import {HttpClient, HttpResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

export interface S3Metadata {
    etag: string;
    lastModified: string;
}

export interface S3ObjectResult {
    arrayBuffer: ArrayBuffer | null;
    etag: string;
    lastModified: string;
}

/**
 * Perform a HEAD request against an S3 URL and return ETag / Last-Modified.
 * Uses the provided HttpClient instance so callers keep DI control.
 */
export async function headObject(http: HttpClient, url: string): Promise<S3Metadata> {
    const response = await firstValueFrom(http.head(url, {
        observe: 'response'
    })) as HttpResponse<any>;

    const etag = response?.headers.get('ETag') || '';
    const lastModified = response?.headers.get('Last-Modified') || '';

    return {etag, lastModified};
}

/**
 * Perform a GET request and return the ArrayBuffer plus metadata.
 */
export async function getObjectArrayBuffer(http: HttpClient, url: string): Promise<S3ObjectResult> {
    const response = await firstValueFrom(http.get(url, {
        responseType: 'arraybuffer' as 'arraybuffer',
        observe: 'response'
    })) as HttpResponse<ArrayBuffer>;

    const arrayBuffer = response?.body || null;
    const etag = response?.headers.get('ETag') || '';
    const lastModified = response?.headers.get('Last-Modified') || '';

    return {arrayBuffer, etag, lastModified};
}

