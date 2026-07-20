import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    /**
     * Constructor
     */
    constructor(private _authService: AuthService) {}

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        const isAuthRequest =
            req.url.includes('/auth/login') ||
            req.url.includes('/auth/refresh');

        const addAuthHeader = (token: string) =>
            req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + token),
            });

        const handleRequest = (request: HttpRequest<any>) =>
            next.handle(request).pipe(
                catchError((error) => {
                    if (
                        error instanceof HttpErrorResponse &&
                        error.status === 401
                    ) {
                        this._authService.signOut();
                    }

                    return throwError(error);
                }),
            );

        if (isAuthRequest) {
            return handleRequest(req);
        }

        const accessToken = this._authService.accessToken;

        if (accessToken && !AuthUtils.isTokenExpired(accessToken)) {
            return handleRequest(addAuthHeader(accessToken));
        }

        if (!this._authService.refreshToken) {
            return handleRequest(req);
        }

        return this._authService.refreshAccessToken().pipe(
            switchMap((refreshed) => {
                if (!refreshed) {
                    return handleRequest(req);
                }

                const newAccessToken = this._authService.accessToken;

                if (!newAccessToken) {
                    return handleRequest(req);
                }

                return handleRequest(addAuthHeader(newAccessToken));
            }),
            catchError((error) => {
                return handleRequest(req);
            }),
        );
    }
}
