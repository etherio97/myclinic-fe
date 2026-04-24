import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVICE_URLS } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    constructor(private http: HttpClient) {}

    getBatchAdmin(params: any) {
        return this.http.get(
            [SERVICE_URLS.DASHBOARD_API, 'batch-admin'].join('/'),
            { params },
        );
    }
}
