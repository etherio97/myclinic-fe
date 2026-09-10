import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVICE_URLS } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class PharmInventoryService {
    constructor(private _http: HttpClient) {}

    getAll() {
        return this._http.get(
            [SERVICE_URLS.PHARM_INVENTORY_API, 'list'].join('/'),
        );
    }
}
