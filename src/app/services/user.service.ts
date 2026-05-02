import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVICE_URLS } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(private _http: HttpClient) {}

    getAll() {
        return this._http.get([SERVICE_URLS.AUTH_API, 'users'].join('/'));
    }

    register(data: any) {
        return this._http.post(
            [SERVICE_URLS.AUTH_API, 'register'].join('/'),
            data,
        );
    }

    remove(id: string) {
        return this._http.post(
            [SERVICE_URLS.AUTH_API, 'delete', id].join('/'),
            null,
        );
    }

    changeStatus(id: string, isActive: boolean) {
        return this._http.post(
            [SERVICE_URLS.AUTH_API, 'change-status', id].join('/'),
            { isActive },
        );
    }

    changeRole(id: string, role: string) {
        return this._http.post(
            [SERVICE_URLS.AUTH_API, 'change-role', id].join('/'),
            { role },
        );
    }

    changePassword(oldPassword: string, newPassword: string) {
        return this._http.post(
            [SERVICE_URLS.AUTH_API, 'change-password'].join('/'),
            { oldPassword, newPassword },
        );
    }
}
