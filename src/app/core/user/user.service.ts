import { Injectable } from '@angular/core';
import { map, Observable, of, ReplaySubject, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private _user: ReplaySubject<any> = new ReplaySubject<any>(1);

    /**
     * Constructor
     */
    constructor() {
        const accessToken = sessionStorage.getItem('accessToken');
        if (accessToken) {
            this.user = JSON.parse(atob(accessToken.split('.')[1]));
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: any) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<any> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<any> {
        const accessToken = sessionStorage.getItem('accessToken');
        if (!accessToken) return of();
        return of(JSON.parse(atob(accessToken.split('.')[1])));
    }
}
