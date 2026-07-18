import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVICE_URLS } from 'app/app.config';
import { LAB_TEST } from 'app/laboratory';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LaboratoryService {
    constructor(private _http: HttpClient) {}

    getAll() {
        return of(LAB_TEST);
    }

    createOrder(data: any) {
        localStorage.setItem('__labOrder', JSON.stringify(data));
        return of({ id: '123', message: 'Success', error: false });
    }

    getOrder(id: string) {
        let item = <string>localStorage.getItem('__labOrder');
        return of(JSON.parse(item));
    }

    createResult(data: any) {
        localStorage.setItem('__labResult', JSON.stringify(data));
        return of({ id: '323', message: 'Success', error: false });
    }

    getResult(id: string) {
        let item = <string>localStorage.getItem('__labResult');
        return of(JSON.parse(item));
    }
}
