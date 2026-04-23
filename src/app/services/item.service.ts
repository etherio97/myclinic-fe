import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVICE_URLS } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class ItemService {
    constructor(private _http: HttpClient) {}

    getAll({
        name,
        itemType,
        category,
    }: {
        name?: string;
        itemType?: string;
        category?: string;
    }) {
        const params: any = {};

        if (name) {
            params.name = name;
        }

        if (itemType) {
            params.itemType = itemType;
        }

        if (category) {
            params.category = category;
        }

        return this._http.get([SERVICE_URLS.ITEM_API, 'list'].join('/'), {
            params,
        });
    }

    findById(id: string) {
        return this._http.get([SERVICE_URLS.ITEM_API, 'list', id].join('/'));
    }

    create(data: any) {
        return this._http.post(
            [SERVICE_URLS.ITEM_API, 'create'].join('/'),
            data,
        );
    }

    update(id: string, data: any) {
        return this._http.post(
            [SERVICE_URLS.ITEM_API, 'update', id].join('/'),
            data,
        );
    }

    remove(id: string) {
        return this._http.post(
            [SERVICE_URLS.ITEM_API, 'delete', id].join('/'),
            null,
        );
    }

    getUtils(): any {
        return this._http.get([SERVICE_URLS.ITEM_API, 'utils'].join('/'));
    }
}
