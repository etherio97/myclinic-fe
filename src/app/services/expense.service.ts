import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVICE_URLS } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class ExpenseService {
    constructor(private _http: HttpClient) {}

    getAll(params: any) {
        return this._http.get([SERVICE_URLS.EXPENSE_API, 'list'].join('/'), {
            params,
        });
    }

    findById(id: string) {
        return this._http.get([SERVICE_URLS.EXPENSE_API, 'list', id].join('/'));
    }

    create(data: any) {
        return this._http.post(
            [SERVICE_URLS.EXPENSE_API, 'create'].join('/'),
            data,
        );
    }

    update(id: string, data: any) {
        return this._http.post(
            [SERVICE_URLS.EXPENSE_API, 'update', id].join('/'),
            data,
        );
    }

    remove(id: string) {
        return this._http.post(
            [SERVICE_URLS.EXPENSE_API, 'delete', id].join('/'),
            null,
        );
    }
}
