import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    catchError,
    finalize,
    Observable,
    of,
    switchMap,
    throwError,
} from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { SERVICE_URLS } from 'app/app.config';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;
    private _refreshTokenInProgress: boolean = false;
    private _refreshToken$?: Observable<boolean>;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _router: Router,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    /**
     * Setter & getter for refresh token
     */
    set refreshToken(token: string) {
        localStorage.setItem('refreshToken', token);
    }

    get refreshToken(): string {
        return localStorage.getItem('refreshToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: {
        username: string;
        password: string;
    }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post([SERVICE_URLS.AUTH_API, 'login'].join('/'), credentials)
            .pipe(
                switchMap((response: any) => {
                    if (response.isDefaultPassword) {
                        return of({
                            isDefaultPassword: true,
                        });
                    }

                    if (!response.access_token || !response.refresh_token) {
                        return of({
                            error: true,
                            message: 'Invalid credentials',
                        });
                    }

                    // Store the access token and refresh token in local storage
                    this.accessToken = response.access_token;
                    this.refreshToken = response.refresh_token;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = JSON.parse(
                        atob(response.access_token.split('.')[1]),
                    );

                    // Return a new observable with the response
                    return of(response);
                }),
            );
    }

    /**
     * Sign in using the access token or refresh token
     */
    signInUsingToken(): Observable<boolean> {
        return this.check().pipe(
            switchMap((authenticated) => of(authenticated)),
        );
    }

    /**
     * Refresh access token using refresh token
     */
    refreshAccessToken(): Observable<boolean> {
        if (this._refreshTokenInProgress && this._refreshToken$) {
            return this._refreshToken$;
        }

        const refreshToken = this.refreshToken;

        if (!refreshToken) {
            return of(false);
        }

        this._refreshTokenInProgress = true;

        this._refreshToken$ = this._httpClient
            .post([SERVICE_URLS.AUTH_API, 'refresh'].join('/'), {
                refresh_token: refreshToken,
            })
            .pipe(
                switchMap((response: any) => {
                    if (!response.access_token) {
                        return of(false);
                    }

                    this.accessToken = response.access_token;
                    console.log(response);

                    this._authenticated = true;

                    this._userService.user = JSON.parse(
                        atob(response.access_token.split('.')[1]),
                    );

                    return of(true);
                }),
                catchError(() => {
                    this.signOut();
                    return of(false);
                }),
                finalize(() => {
                    this._refreshTokenInProgress = false;
                    this._refreshToken$ = undefined;
                }),
            );

        return this._refreshToken$;
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove tokens from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Reset the authenticated flag
        this._authenticated = false;

        // Reset the user state
        this._userService.user = null;

        this._router.navigate(['/login']);

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is already authenticated
        if (this._authenticated) {
            return of(true);
        }

        // If there is no access token, try to refresh using refresh token
        if (!this.accessToken) {
            if (!this.refreshToken) {
                return of(false);
            }
            return this.refreshAccessToken();
        }

        // If the access token exists but is expired, try to refresh it
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            if (!this.refreshToken) {
                return of(false);
            }
            return this.refreshAccessToken();
        }

        // If the access token is valid, restore the authenticated state
        this._authenticated = true;
        this._userService.user = JSON.parse(
            atob(this.accessToken.split('.')[1]),
        );

        return of(true);
    }
}
