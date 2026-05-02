import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVICE_URLS } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class CashflowService {
    constructor(private _http: HttpClient) {}

    getAll(params: any) {
        return this._http.get([SERVICE_URLS.CASHFLOW_API, 'list'].join('/'), {
            params,
        });
    }

    create(data: any) {
        return this._http.post(
            [SERVICE_URLS.CASHFLOW_API, 'create'].join('/'),
            data,
        );
    }

    update(id: string, data: any) {
        return this._http.post(
            [SERVICE_URLS.CASHFLOW_API, 'update', id].join('/'),
            data,
        );
    }

    remove(id: string) {
        return this._http.post(
            [SERVICE_URLS.CASHFLOW_API, 'delete', id].join('/'),
            null,
        );
    }
}
