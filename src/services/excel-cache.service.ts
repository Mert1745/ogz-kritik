import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as XLSX from 'xlsx';
import {S3_URL} from '../constants/aws';
import { headObject, getObjectArrayBuffer } from '../client/aws-client';

interface CachedExcelData {
    data: any[];
    etag: string;
    lastModified: string;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class ExcelCacheService {
    private DB_NAME = 'ExcelCache';
    private STORE_NAME = 'excelData';
    private db: IDBDatabase | null = null;

    constructor(private http: HttpClient) {
        this.initDB();
    }

    private async initDB(): Promise<void> {
        // Check if indexedDB is available
        if (typeof indexedDB === 'undefined') {
            console.warn('IndexedDB is not available in this environment');
            return;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME);
                }
            };
        });
    }

    async getExcelData(): Promise<any[]> {
        // Ensure DB is ready
        if (!this.db) await this.initDB();

        // Check if file changed on S3
        const hasChanged = await this.checkIfFileChanged();

        if (hasChanged) {
            // Download and cache new data
            return await this.downloadAndCacheExcel();
        } else {
            // Return cached data
            const cached = await this.getCachedData();
            return cached ? cached.data : await this.downloadAndCacheExcel();
        }
    }

    private async checkIfFileChanged(): Promise<boolean> {
        try {
            // Use helper that performs HEAD and returns metadata
            const { etag: newEtag, lastModified: newLastModified } = await headObject(this.http, S3_URL);

            const cached = await this.getCachedData();

            if (!cached) return true; // No cache, need to download

            // Compare ETags or Last-Modified dates
            return cached.etag !== newEtag ||
                cached.lastModified !== newLastModified;

        } catch (error) {
            console.error('Error checking file status:', error);
            return true; // On error, download fresh data
        }
    }

    private async downloadAndCacheExcel(): Promise<any[]> {
        try {
            // Use helper to download file as arraybuffer and metadata
            const { arrayBuffer, etag, lastModified } = await getObjectArrayBuffer(this.http, S3_URL);

            if (!arrayBuffer) throw new Error('Downloaded empty arrayBuffer');

            // Parse Excel
            const workbook = XLSX.read(arrayBuffer, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(firstSheet);

            // Cache to IndexedDB
            await this.cacheData({
                data,
                etag,
                lastModified,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('Error downloading Excel:', error);
            throw error;
        }
    }

    private async getCachedData(): Promise<CachedExcelData | null> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve(null);
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get('excelData');

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    private async cacheData(data: CachedExcelData): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                console.warn('DB not initialized');
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(data, 'excelData');

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Optional: Clear cache manually
    async clearCache(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('DB not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
