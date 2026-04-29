import { Injectable } from '@angular/core';
import {
    FuseConfirmationConfig,
    FuseConfirmationService,
} from '@fuse/services/confirmation';

@Injectable({
    providedIn: 'root',
})
export class ConfirmService {
    constructor(private _fuseConfirmService: FuseConfirmationService) {}

    success(message: string, title = 'Success') {
        return this.open({
            title,
            message,
            icon: { color: 'success', name: 'mat_outline:check' },
            actions: {
                confirm: { show: false },
                cancel: { label: 'OK' },
            },
            dismissible: true,
        });
    }

    error(message: string, title = 'Error') {
        return this.open({
            title,
            message,
            icon: { color: 'error', name: 'mat_outline:cancel' },
            actions: {
                confirm: { show: false },
                cancel: { label: 'OK' },
            },
            dismissible: true,
        });
    }

    confirm(message: string, title = 'Confirmation') {
        return this.open({
            title,
            message,
            icon: { color: 'warning', name: 'mat_outline:warning_amber' },
            actions: { confirm: { color: 'primary' } },
            dismissible: true,
        });
    }

    open(config: FuseConfirmationConfig) {
        return this._fuseConfirmService.open(config);
    }
}
