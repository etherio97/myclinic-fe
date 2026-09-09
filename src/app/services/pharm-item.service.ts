import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVICE_URLS } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class PharmItemService {
    constructor(private _http: HttpClient) {}

    getAll({
        name,
        code,
        barcode,
    }: {
        name?: string;
        code?: string;
        barcode?: string;
    }) {
        const params: any = {};

        if (name) {
            params.name = name;
        }

        if (code) {
            params.code = code;
        }

        if (barcode) {
            params.barcode = barcode;
        }

        return this._http.get([SERVICE_URLS.PHARM_ITEM_API, 'list'].join('/'), {
            params,
        });
    }

    findById(id: string) {
        return this._http.get(
            [SERVICE_URLS.PHARM_ITEM_API, 'list', id].join('/'),
        );
    }

    create(data: any) {
        return this._http.post(
            [SERVICE_URLS.PHARM_ITEM_API, 'create'].join('/'),
            data,
        );
    }

    update(id: string, data: any) {
        return this._http.post(
            [SERVICE_URLS.PHARM_ITEM_API, 'update', id].join('/'),
            data,
        );
    }

    remove(id: string) {
        return this._http.post(
            [SERVICE_URLS.PHARM_ITEM_API, 'delete', id].join('/'),
            null,
        );
    }
}
