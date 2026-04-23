import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVICE_URLS } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class PatientService {
    constructor(private _http: HttpClient) {}

    getAll({ fullName, patientNo }: { fullName?: string; patientNo?: string }) {
        const params: any = {};

        if (fullName) {
            params.fullName = fullName;
        }

        if (patientNo) {
            params.patientNo = patientNo;
        }

        return this._http.get([SERVICE_URLS.PATIENT_API, 'list'].join('/'), {
            params,
        });
    }

    findById(id: string) {
        return this._http.get([SERVICE_URLS.PATIENT_API, 'list', id].join('/'));
    }

    create(data: any) {
        return this._http.post(
            [SERVICE_URLS.PATIENT_API, 'create'].join('/'),
            data,
        );
    }

    update(id: string, data: any) {
        return this._http.post(
            [SERVICE_URLS.PATIENT_API, 'update', id].join('/'),
            data,
        );
    }

    remove(id: string) {
        return this._http.post(
            [SERVICE_URLS.PATIENT_API, 'delete', id].join('/'),
            null,
        );
    }
}
