import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVICE_URLS } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    constructor(private _http: HttpClient) {}

    getAll(params: any) {
        return this._http.get(
            [SERVICE_URLS.APPOINTMENT_API, 'list'].join('/'),
            {
                params,
            },
        );
    }

    getPatientAppointments(patientId: string) {
        return this._http.get(
            [
                SERVICE_URLS.APPOINTMENT_API,
                'patient-appointments',
                patientId,
            ].join('/'),
        );
    }

    getDoctorAppointments(doctorId: string) {
        return this._http.get(
            [
                SERVICE_URLS.APPOINTMENT_API,
                'doctor-appointments',
                doctorId,
            ].join('/'),
        );
    }

    findById(id: string) {
        return this._http.get(
            [SERVICE_URLS.APPOINTMENT_API, 'list', id].join('/'),
        );
    }

    create(data: any) {
        return this._http.post(
            [SERVICE_URLS.APPOINTMENT_API, 'create'].join('/'),
            data,
        );
    }

    update(id: string, data: any) {
        return this._http.post(
            [SERVICE_URLS.APPOINTMENT_API, 'update', id].join('/'),
            data,
        );
    }

    remove(id: string) {
        return this._http.post(
            [SERVICE_URLS.APPOINTMENT_API, 'delete', id].join('/'),
            null,
        );
    }
}
