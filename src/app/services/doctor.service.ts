import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVICE_URLS } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class DoctorService {
    constructor(private _http: HttpClient) {}

    getAll({ fullName, doctorNo }: { fullName?: string; doctorNo?: string }) {
        const params: any = {};

        if (fullName) {
            params.fullName = fullName;
        }

        if (doctorNo) {
            params.doctorNo = doctorNo;
        }

        return this._http.get([SERVICE_URLS.DOCTOR_API, 'list'].join('/'), {
            params,
        });
    }

    findById(id: string) {
        return this._http.get([SERVICE_URLS.DOCTOR_API, 'list', id].join('/'));
    }

    create(data: any) {
        return this._http.post(
            [SERVICE_URLS.DOCTOR_API, 'create'].join('/'),
            data,
        );
    }

    update(id: string, data: any) {
        return this._http.post(
            [SERVICE_URLS.DOCTOR_API, 'update', id].join('/'),
            data,
        );
    }

    remove(id: string) {
        return this._http.post(
            [SERVICE_URLS.DOCTOR_API, 'delete', id].join('/'),
            null,
        );
    }
}
